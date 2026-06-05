import { Dispute, Order, Payment, User } from '@prisma/client';

export type OrderWithRelations = Order & {
  buyer: User;
  seller: User;
  payment: Payment | null;
  dispute: Dispute | null;
};

/** Shape aligned with the frontend `ORDERS` mock for easier wiring later. */
export function toOrderDto(order: OrderWithRelations) {
  const statusMap: Record<string, string> = {
    PAYMENT_PENDING: 'payment_pending',
    AWAITING_DISPATCH: 'awaiting_dispatch',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    DISPUTE: 'dispute',
    CANCELLED: 'cancelled',
  };

  const autoReleaseHours =
    order.autoReleaseAt && order.status === 'IN_TRANSIT'
      ? Math.max(
          0,
          Math.ceil((order.autoReleaseAt.getTime() - Date.now()) / (60 * 60 * 1000)),
        )
      : 0;

  return {
    id: order.publicId,
    internalId: order.id,
    buyer: order.buyer.name,
    buyerId: order.buyerId,
    seller: order.seller.name,
    sellerId: order.sellerId,
    item: order.itemDescription,
    amount: Number(order.amountZmw),
    status: statusMap[order.status] ?? order.status.toLowerCase(),
    tracking: order.trackingNumber ?? '',
    courier: order.courier ?? '',
    origin: order.origin ?? '',
    destination: order.destination ?? '',
    dispatched: order.dispatchedAt?.toISOString() ?? '',
    estimated: order.estimatedAt?.toISOString() ?? '',
    arrivalConfirmed: Boolean(order.arrivalAt),
    buyerConfirmed: Boolean(order.buyerConfirmedAt),
    dispute: order.status === 'DISPUTE',
    disputeReason: order.dispute
      ? `${order.dispute.reason}${order.dispute.detail ? ' — ' + order.dispute.detail : ''}`
      : undefined,
    autoReleaseHours,
    paymentStatus: order.payment?.status.toLowerCase(),
    paymentProvider: order.paymentProvider?.toLowerCase(),
    createdAt: order.createdAt.toISOString(),
  };
}
