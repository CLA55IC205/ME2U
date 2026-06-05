import {
  DisputeStatus,
  LedgerType,
  OrderStatus,
  PaymentStatus,
  Prisma,
  UserRole,
  WalletProvider,
} from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.js';
import { OrderWithRelations, toOrderDto } from '../lib/orderMapper.js';
import { env } from '../config/env.js';

const orderInclude = {
  buyer: true,
  seller: true,
  payment: true,
  dispute: true,
} as const;

async function nextPublicId(): Promise<string> {
  const last = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { publicId: true },
  });
  const num = last ? parseInt(last.publicId.replace('ME2U-', ''), 10) + 1 : 1;
  return `ME2U-${String(num).padStart(4, '0')}`;
}

export async function listOrdersForUser(userId: string, role: UserRole) {
  const where =
    role === UserRole.ADMIN
      ? {}
      : role === UserRole.BUYER
        ? { buyerId: userId }
        : { sellerId: userId };

  const orders = await prisma.order.findMany({
    where,
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
  return orders.map(toOrderDto);
}

export async function getOrderByPublicId(publicId: string, userId?: string, role?: UserRole) {
  const order = await prisma.order.findUnique({
    where: { publicId },
    include: orderInclude,
  });
  if (!order) throw notFound('Order not found');
  if (userId && role && role !== UserRole.ADMIN) {
    if (role === UserRole.BUYER && order.buyerId !== userId) throw forbidden();
    if (role === UserRole.SELLER && order.sellerId !== userId) throw forbidden();
  }
  return toOrderDto(order);
}

async function loadOrderOrThrow(publicId: string): Promise<OrderWithRelations> {
  const order = await prisma.order.findUnique({
    where: { publicId },
    include: orderInclude,
  });
  if (!order) throw notFound('Order not found');
  return order;
}

export async function createOrder(input: {
  buyerId: string;
  sellerPhone: string;
  sellerName?: string;
  itemDescription: string;
  amountZmw: number;
  origin?: string;
  destination: string;
  courier?: string;
  notes?: string;
  paymentProvider: WalletProvider;
}) {
  let seller = await prisma.user.findUnique({ where: { phone: normalizePhone(input.sellerPhone) } });
  if (!seller) {
    seller = await prisma.user.create({
      data: {
        phone: normalizePhone(input.sellerPhone),
        name: input.sellerName ?? input.sellerPhone,
        role: UserRole.SELLER,
      },
    });
  }

  const publicId = await nextPublicId();
  const order = await prisma.order.create({
    data: {
      publicId,
      buyerId: input.buyerId,
      sellerId: seller.id,
      itemDescription: input.itemDescription,
      amountZmw: new Prisma.Decimal(input.amountZmw),
      status: OrderStatus.PAYMENT_PENDING,
      origin: input.origin,
      destination: input.destination,
      courier: input.courier,
      notes: input.notes,
      paymentProvider: input.paymentProvider,
      payment: {
        create: {
          status: PaymentStatus.PENDING,
          provider: input.paymentProvider,
        },
      },
    },
    include: orderInclude,
  });

  return {
    order: toOrderDto(order),
    paymentInstructions: {
      message: `Pay K ${input.amountZmw.toFixed(2)} to ME2U ${input.paymentProvider} escrow.`,
      reference: publicId,
    },
  };
}

/** Simulates mobile-money webhook confirming escrow (replace with real provider later). */
export async function confirmPayment(publicId: string, buyerId: string) {
  const order = await loadOrderOrThrow(publicId);
  if (order.buyerId !== buyerId) throw forbidden();
  if (order.status !== OrderStatus.PAYMENT_PENDING) {
    throw conflict('Order is not awaiting payment');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { orderId: order.id },
      data: { status: PaymentStatus.ESCROWED, escrowedAt: new Date() },
    });
    await tx.escrowLedgerEntry.create({
      data: {
        orderId: order.id,
        type: LedgerType.HOLD,
        amountZmw: order.amountZmw,
        note: 'Payment confirmed — funds held in escrow',
      },
    });
    return tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.AWAITING_DISPATCH },
      include: orderInclude,
    });
  });

  return toOrderDto(updated);
}

export async function markDispatched(
  publicId: string,
  sellerId: string,
  input: { courier: string; trackingNumber?: string },
) {
  const order = await loadOrderOrThrow(publicId);
  if (order.sellerId !== sellerId) throw forbidden();
  if (order.status !== OrderStatus.AWAITING_DISPATCH) {
    throw badRequest('Order must be awaiting dispatch');
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.IN_TRANSIT,
      courier: input.courier,
      trackingNumber: input.trackingNumber || null,
      dispatchedAt: new Date(),
    },
    include: orderInclude,
  });

  await prisma.deliveryEvent.create({
    data: {
      orderId: order.id,
      title: 'Parcel dispatched',
      detail: `Via ${input.courier}`,
    },
  });

  return toOrderDto(updated);
}

export async function markArrival(publicId: string, sellerId: string) {
  const order = await loadOrderOrThrow(publicId);
  if (order.sellerId !== sellerId) throw forbidden();
  if (order.status !== OrderStatus.IN_TRANSIT) {
    throw badRequest('Order must be in transit');
  }

  const autoReleaseAt = new Date(
    Date.now() + env.autoReleaseHours * 60 * 60 * 1000,
  );

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { arrivalAt: new Date(), autoReleaseAt },
    include: orderInclude,
  });

  return toOrderDto(updated);
}

export async function confirmReceipt(publicId: string, buyerId: string) {
  const order = await loadOrderOrThrow(publicId);
  if (order.buyerId !== buyerId) throw forbidden();
  if (order.status === OrderStatus.DISPUTE) {
    throw conflict('Cannot confirm while dispute is open');
  }
  if (order.status !== OrderStatus.IN_TRANSIT) {
    throw badRequest('Order must be in transit before confirming receipt');
  }

  return releaseToSeller(order, 'Buyer confirmed receipt');
}

async function releaseToSeller(order: OrderWithRelations, note: string) {
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
        buyerConfirmedAt: new Date(),
        autoReleaseAt: null,
      },
      include: orderInclude,
    });
  });

  return toOrderDto(updated);
}

export async function raiseDispute(
  publicId: string,
  buyerId: string,
  input: { reason: string; detail?: string },
) {
  const order = await loadOrderOrThrow(publicId);
  if (order.buyerId !== buyerId) throw forbidden();
  if (order.dispute) throw conflict('Dispute already exists');

  const updated = await prisma.$transaction(async (tx) => {
    await tx.dispute.create({
      data: {
        orderId: order.id,
        raisedById: buyerId,
        reason: input.reason,
        detail: input.detail,
        status: DisputeStatus.OPEN,
      },
    });
    return tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.DISPUTE, autoReleaseAt: null },
      include: orderInclude,
    });
  });

  return toOrderDto(updated);
}

export async function trackByNumber(trackingNumber: string) {
  const order = await prisma.order.findFirst({
    where: { trackingNumber },
    include: { ...orderInclude, events: { orderBy: { occurredAt: 'asc' } } },
  });
  if (!order) throw notFound('No parcel found for this tracking number');

  return {
    order: toOrderDto(order),
    timeline: order.events.map((e) => ({
      title: e.title,
      detail: e.detail,
      time: e.occurredAt.toISOString(),
    })),
  };
}

export async function runAutoReleases() {
  const due = await prisma.order.findMany({
    where: {
      status: OrderStatus.IN_TRANSIT,
      autoReleaseAt: { lte: new Date() },
      dispute: null,
      buyerConfirmedAt: null,
    },
    include: orderInclude,
  });

  const released = [];
  for (const order of due) {
    released.push(await releaseToSeller(order, 'Auto-release after 24h window'));
  }
  return released;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}
