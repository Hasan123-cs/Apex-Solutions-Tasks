
using OrderManagement.Domain.Entities;

namespace OrderManagement.Application.Interfaces;

public interface IOrderService
{
    Task<Guid> CreateOrderAsync(
        IEnumerable<(Guid ProductId, int Quantity, decimal UnitPrice)> items);

    Task AddProductAsync(
        Guid orderId,
        Guid productId,
        int quantity,
        decimal unitPrice);

    Task ConfirmOrderAsync(Guid orderId);

    Task<Order?> GetOrderByIdAsync(Guid orderId);
}
