import {
  DisputeStatus,
  OrderStatus,
  PaymentStatus,
  Prisma,
  PrismaClient,
  UserRole,
  WalletProvider,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.escrowLedgerEntry.deleteMany();
  await prisma.deliveryEvent.deleteMany();
  await prisma.driverConfirmToken.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();

  const chanda = await prisma.user.create({
    data: {
      phone: '0977441882',
      name: 'Chanda Mwale',
      role: UserRole.BUYER,
      walletProvider: WalletProvider.AIRTEL,
    },
  });
  const mulenga = await prisma.user.create({
    data: { phone: '0971000001', name: 'Mulenga Bwalya', role: UserRole.BUYER },
  });
  const thandiwe = await prisma.user.create({
    data: { phone: '0971000002', name: 'Thandiwe Phiri', role: UserRole.BUYER },
  });
  const brian = await prisma.user.create({
    data: { phone: '0971000003', name: 'Brian Lungu', role: UserRole.BUYER },
  });
  const namukolo = await prisma.user.create({
    data: { phone: '0971000004', name: 'Namukolo Sikazwe', role: UserRole.BUYER },
  });

  const techZone = await prisma.user.create({
    data: {
      phone: '0955330221',
      name: 'TechZone Lusaka',
      role: UserRole.SELLER,
      walletProvider: WalletProvider.MTN,
    },
  });
  const chizy = await prisma.user.create({
    data: { phone: '0955000001', name: 'ChizyShop', role: UserRole.SELLER },
  });
  const freshMarket = await prisma.user.create({
    data: { phone: '0955000002', name: 'FreshMarket ZM', role: UserRole.SELLER },
  });
  const babyGear = await prisma.user.create({
    data: { phone: '0955000003', name: 'BabyGear ZM', role: UserRole.SELLER },
  });

  await prisma.user.create({
    data: { phone: '0000000000', name: 'Admin · ME2U', role: UserRole.ADMIN },
  });

  type SeedOrder = {
    publicId: string;
    buyerId: string;
    sellerId: string;
    item: string;
    amount: number;
    status: OrderStatus;
    tracking?: string;
    courier?: string;
    origin?: string;
    destination?: string;
    dispatchedAt?: Date;
    estimatedAt?: Date;
    arrivalAt?: Date;
    buyerConfirmedAt?: Date;
    autoReleaseAt?: Date;
    dispute?: { reason: string; status: DisputeStatus };
  };

  const orders: SeedOrder[] = [
    {
      publicId: 'ME2U-0041',
      buyerId: chanda.id,
      sellerId: techZone.id,
      item: 'Wireless Earbuds (2×)',
      amount: 380,
      status: OrderStatus.IN_TRANSIT,
      tracking: 'ZAM-2947831',
      courier: 'Zampost',
      origin: 'Lusaka CBD',
      destination: 'Chilenje',
      dispatchedAt: new Date('2025-06-02T09:14:00'),
      estimatedAt: new Date('2025-06-03T17:00:00'),
      autoReleaseAt: new Date(Date.now() + 18 * 60 * 60 * 1000),
    },
    {
      publicId: 'ME2U-0038',
      buyerId: mulenga.id,
      sellerId: chizy.id,
      item: 'Phone Case + Screen Guard',
      amount: 95,
      status: OrderStatus.DELIVERED,
      courier: 'Own driver',
      origin: 'Kabwata',
      destination: 'Matero',
      dispatchedAt: new Date('2025-06-01T11:30:00'),
      estimatedAt: new Date('2025-06-01T15:00:00'),
      arrivalAt: new Date('2025-06-01T15:00:00'),
      buyerConfirmedAt: new Date('2025-06-01T16:00:00'),
    },
    {
      publicId: 'ME2U-0035',
      buyerId: thandiwe.id,
      sellerId: freshMarket.id,
      item: 'Kapenta 10kg + Groundnuts',
      amount: 620,
      status: OrderStatus.DISPUTE,
      tracking: 'ZAM-2939012',
      courier: 'Zampost',
      origin: 'Livingstone',
      destination: 'Lusaka',
      dispatchedAt: new Date('2025-05-30T08:00:00'),
      estimatedAt: new Date('2025-06-01T12:00:00'),
      arrivalAt: new Date('2025-06-01T12:00:00'),
      dispute: {
        reason: 'Package arrived damaged',
        status: DisputeStatus.OPEN,
      },
    },
    {
      publicId: 'ME2U-0033',
      buyerId: brian.id,
      sellerId: techZone.id,
      item: 'USB-C Hub',
      amount: 210,
      status: OrderStatus.AWAITING_DISPATCH,
      origin: 'Lusaka CBD',
      destination: 'Woodlands',
    },
    {
      publicId: 'ME2U-0029',
      buyerId: namukolo.id,
      sellerId: babyGear.id,
      item: 'Feeding Bottles Set',
      amount: 155,
      status: OrderStatus.DELIVERED,
      courier: 'Own driver',
      origin: 'Ibex Hill',
      destination: 'Kabulonga',
      dispatchedAt: new Date('2025-05-28T10:00:00'),
      estimatedAt: new Date('2025-05-28T13:00:00'),
      arrivalAt: new Date('2025-05-28T13:00:00'),
      buyerConfirmedAt: new Date('2025-05-28T14:00:00'),
    },
  ];

  for (const o of orders) {
    const order = await prisma.order.create({
      data: {
        publicId: o.publicId,
        buyerId: o.buyerId,
        sellerId: o.sellerId,
        itemDescription: o.item,
        amountZmw: new Prisma.Decimal(o.amount),
        status: o.status,
        origin: o.origin,
        destination: o.destination,
        courier: o.courier,
        trackingNumber: o.tracking,
        dispatchedAt: o.dispatchedAt,
        estimatedAt: o.estimatedAt,
        arrivalAt: o.arrivalAt,
        buyerConfirmedAt: o.buyerConfirmedAt,
        autoReleaseAt: o.autoReleaseAt,
        paymentProvider: WalletProvider.AIRTEL,
      },
    });

    const payStatus =
      o.status === OrderStatus.DELIVERED
        ? PaymentStatus.RELEASED
        : o.status === OrderStatus.PAYMENT_PENDING
          ? PaymentStatus.PENDING
          : PaymentStatus.ESCROWED;

    await prisma.payment.create({
      data: {
        orderId: order.id,
        status: payStatus,
        provider: WalletProvider.AIRTEL,
        escrowedAt: payStatus !== PaymentStatus.PENDING ? new Date() : undefined,
        releasedAt: payStatus === PaymentStatus.RELEASED ? new Date() : undefined,
      },
    });

    if (payStatus === PaymentStatus.ESCROWED || payStatus === PaymentStatus.RELEASED) {
      await prisma.escrowLedgerEntry.create({
        data: {
          orderId: order.id,
          type: 'HOLD',
          amountZmw: new Prisma.Decimal(o.amount),
          note: 'Buyer payment held in escrow',
        },
      });
    }

    if (o.dispute) {
      await prisma.dispute.create({
        data: {
          orderId: order.id,
          raisedById: o.buyerId,
          reason: o.dispute.reason,
          detail:
            'Package arrived damaged — kapenta bag was torn open. Photos submitted.',
          status: o.dispute.status,
        },
      });
    }

    if (o.tracking) {
      await prisma.deliveryEvent.createMany({
        data: [
          {
            orderId: order.id,
            title: 'Parcel received by courier',
            detail: `Collected from ${o.origin}`,
            occurredAt: o.dispatchedAt ?? new Date(),
          },
          {
            orderId: order.id,
            title: 'Out for delivery',
            detail: `Destination: ${o.destination}`,
            occurredAt: new Date(),
          },
        ],
      });
    }
  }

  console.log('Seed complete:', {
    users: await prisma.user.count(),
    orders: await prisma.order.count(),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
