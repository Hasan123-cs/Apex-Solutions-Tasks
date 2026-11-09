
using System.Collections.Concurrent;
using OrderManagement.Domain.Entities;
using OrderManagement.Domain.Repositories;

namespace OrderManagement.Infrastructure.Repositories;

public class InMemoryOrderRepository : IOrderRepository
{
    private readonly ConcurrentDictionary<Guid, Order> _orders = new();

    public Task AddAsync(Order order)
    {
        if (!_orders.TryAdd(order.Id, order))
        {
            throw new InvalidOperationException(
                "Order already exists.");
        }

        return Task.CompletedTask;
    }

    public Task<Order?> GetByIdAsync(Guid id)
    {
        _orders.TryGetValue(id, out var order);

        return Task.FromResult(order);
    }

    public Task UpdateAsync(Order order)
    {
        if (!_orders.ContainsKey(order.Id))
        {
            throw new KeyNotFoundException(
                "Order not found.");
        }

        _orders[order.Id] = order;

        return Task.CompletedTask;
    }
}
