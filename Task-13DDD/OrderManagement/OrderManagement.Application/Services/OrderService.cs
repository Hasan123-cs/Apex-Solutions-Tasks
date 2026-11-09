
using OrderManagement.Application.Interfaces;
using OrderManagement.Domain.Entities;
using OrderManagement.Domain.Repositories;

namespace OrderManagement.Application.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;

    public OrderService(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<Guid> CreateOrderAsync(
        IEnumerable<(Guid ProductId, int Quantity, decimal UnitPrice)> items)
    {
        var order = new Order();

        foreach (var item in items)
        {
            order.AddItem(
                item.ProductId,
                item.Quantity,
                item.UnitPrice);
        }

        await _orderRepository.AddAsync(order);

        return order.Id;
    }

    public async Task AddProductAsync(
        Guid orderId,
        Guid productId,
        int quantity,
        decimal unitPrice)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);

        if (order is null)
            throw new KeyNotFoundException("Order not found.");

        order.AddItem(productId, quantity, unitPrice);

        await _orderRepository.UpdateAsync(order);
    }

    public async Task ConfirmOrderAsync(Guid orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);

        if (order is null)
            throw new KeyNotFoundException("Order not found.");

        order.Confirm();

        await _orderRepository.UpdateAsync(order);
    }

    public async Task<Order?> GetOrderByIdAsync(Guid orderId)
    {
        return await _orderRepository.GetByIdAsync(orderId);
    }
}
