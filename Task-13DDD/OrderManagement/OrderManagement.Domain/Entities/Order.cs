
using OrderManagement.Domain.Enums;

namespace OrderManagement.Domain.Entities;

public class Order
{
    private readonly List<OrderItem> _items = new();

    public Guid Id { get; private set; }

    public OrderStatus Status { get; private set; }

    public IReadOnlyCollection<OrderItem> Items =>
        _items.AsReadOnly();

    public decimal TotalAmount =>
        _items.Sum(item => item.TotalPrice);

    public Order()
    {
        Id = Guid.NewGuid();
        Status = OrderStatus.Pending;
    }

    public void AddItem(
        Guid productId,
        int quantity,
        decimal unitPrice)
    {
        if (Status == OrderStatus.Confirmed)
        {
            throw new InvalidOperationException(
                "Cannot modify a confirmed order.");
        }

        var item = new OrderItem(
            productId,
            quantity,
            unitPrice);

        _items.Add(item);
    }

    public void Confirm()
    {
        if (Status == OrderStatus.Confirmed)
        {
            throw new InvalidOperationException(
                "Order is already confirmed.");
        }

        if (!_items.Any())
        {
            throw new InvalidOperationException(
                "Cannot confirm an empty order.");
        }

        Status = OrderStatus.Confirmed;
    }
}
