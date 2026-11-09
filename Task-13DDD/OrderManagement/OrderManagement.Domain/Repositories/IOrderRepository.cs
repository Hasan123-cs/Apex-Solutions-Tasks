
using OrderManagement.Domain.Entities;

namespace OrderManagement.Domain.Repositories;

public interface IOrderRepository
{
    Task AddAsync(Order order);

    Task<Order?> GetByIdAsync(Guid id);

    Task UpdateAsync(Order order);
}
