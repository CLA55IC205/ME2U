import {
  DisputeStatus,
  LedgerType,
  OrderStatus,
  PaymentStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { badRequest, notFound } from '../lib/errors.js';
import { toOrderDto } from '../lib/orderMapper.js';

async function adminReleaseOrder(orderId: string, note: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { buyer: true, seller: true, payment: true, dispute: true },
  });
  if (!order) throw notFound('Order not found');

  const updated = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { orderId: order.id },
      data: { status: PaymentStatus.RELEASED, releasedAt: new Date() },
    });
    await tx.escrowLedgerEntry.create({
      data: {
        orderId: order.id,
        type: LedgerType.RELEASE,
        amountZmw: order.amountZmw,
        note,
      },
    });
    return tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.DELIVERED,
        buyerConfirmedAt: order.buyerConfirmedAt ?? new Date(),
        autoReleaseAt: null,
      },
      include: { buyer: true, seller: true, payment: true, dispute: true },
    });
  });

  return toOrderDto(updated);
}

export async function getEscrowSummary() {
  const heldOrders = await prisma.order.findMany({
    where: {
      status: { in: [OrderStatus.AWAITING_DISPATCH, OrderStatus.IN_TRANSIT, OrderStatus.DISPUTE] },
      payment: { status: PaymentStatus.ESCROWED },
    },
    include: { buyer: true, seller: true, payment: true, dispute: true },
  });

  const total = heldOrders.reduce((s, o) => s + Number(o.amountZmw), 0);
  const airtel = heldOrders
    .filter((o) => o.payment?.provider === 'AIRTEL')
    .reduce((s, o) => s + Number(o.amountZmw), 0);
  const mtn = total - airtel;

  return {
    totalHeldZmw: total,
    byProvider: { airtel, mtn },
    orders: heldOrders.map(toOrderDto),
  };
}

export async function listAllOrders() {
  const orders = await prisma.order.findMany({
    include: { buyer: true, seller: true, payment: true, dispute: true },
    orderBy: { createdAt: 'desc' },
  });
  return orders.map(toOrderDto);
}

export async function listOpenDisputes() {
  const disputes = await prisma.dispute.findMany({
    where: { status: DisputeStatus.OPEN },
    include: {
      order: { include: { buyer: true, seller: true, payment: true, dispute: true } },
      raisedBy: true,
    },
  });
  return disputes.map((d) => ({
    ...toOrderDto(d.order),
    disputeId: d.id,
    disputeReason: `${d.reason}${d.detail ? ' — ' + d.detail : ''}`,
  }));
}

export async function resolveDispute(
  publicId: string,
  resolution: 'seller' | 'buyer' | 'split',
) {
  const order = await prisma.order.findUnique({
    where: { publicId },
    include: { buyer: true, seller: true, payment: true, dispute: true },
  });
  if (!order?.dispute) throw notFound('Open dispute not found');

  const amount = order.amountZmw;
  const half = new Prisma.Decimal(Number(amount) / 2);

  const disputeStatusMap = {
    seller: DisputeStatus.RESOLVED_SELLER,
    buyer: DisputeStatus.RESOLVED_BUYER,
    split: DisputeStatus.RESOLVED_SPLIT,
  } as const;

  await prisma.dispute.update({
    where: { id: order.dispute.id },
    data: {
      status: disputeStatusMap[resolution],
      resolvedAt: new Date(),
    },
  });

  if (resolution === 'seller') {
    return adminReleaseOrder(order.id, 'Admin resolved dispute — release to seller');
  }

  if (resolution === 'buyer') {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: order.id },
        data: { status: PaymentStatus.REFUNDED },
      });
      await tx.escrowLedgerEntry.create({
        data: {
          orderId: order.id,
          type: LedgerType.REFUND,
          amountZmw: amount,
          note: 'Admin resolved dispute — refund buyer',
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });
    });
    const refreshed = await prisma.order.findUnique({
      where: { id: order.id },
      include: { buyer: true, seller: true, payment: true, dispute: true },
    });
    return toOrderDto(refreshed!);
  }

  // split
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { orderId: order.id },
      data: { status: PaymentStatus.RELEASED, releasedAt: new Date() },
    });
    await tx.escrowLedgerEntry.createMany({
      data: [
        {
          orderId: order.id,
          type: LedgerType.SPLIT,
          amountZmw: half,
          note: '50% release to seller',
        },
        {
          orderId: order.id,
          type: LedgerType.SPLIT,
          amountZmw: half,
          note: '50% refund to buyer',
        },
      ],
    });
    await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.DELIVERED },
    });
  });

  const refreshed = await prisma.order.findUnique({
    where: { id: order.id },
    include: { buyer: true, seller: true, payment: true, dispute: true },
  });
  return toOrderDto(refreshed!);
}

export async function forceRelease(publicId: string) {
  const order = await prisma.order.findUnique({
    where: { publicId },
    include: { buyer: true, seller: true, payment: true, dispute: true },
  });
  if (!order) throw notFound('Order not found');
  if (order.status === OrderStatus.DELIVERED) {
    throw badRequest('Order already delivered');
  }
  if (order.status === OrderStatus.DISPUTE) {
    throw badRequest('Resolve dispute before force release');
  }
  return adminReleaseOrder(order.id, 'Admin force release');
}

export async function listPendingAutoReleases() {
  const orders = await prisma.order.findMany({
    where: {
      status: OrderStatus.IN_TRANSIT,
      autoReleaseAt: { not: null },
      buyerConfirmedAt: null,
      dispute: null,
    },
    include: { buyer: true, seller: true, payment: true, dispute: true },
    orderBy: { autoReleaseAt: 'asc' },
  });
  return orders.map(toOrderDto);
}

export async function listUsersSummary() {
  const users = await prisma.user.findMany({
    where: { role: { not: UserRole.ADMIN } },
    orderBy: { name: 'asc' },
  });

  return Promise.all(
    users.map(async (u) => {
      const orderCount =
        u.role === UserRole.BUYER
          ? await prisma.order.count({ where: { buyerId: u.id } })
          : await prisma.order.count({ where: { sellerId: u.id } });
      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        role: u.role.toLowerCase(),
        orderCount,
      };
    }),
  );
}
