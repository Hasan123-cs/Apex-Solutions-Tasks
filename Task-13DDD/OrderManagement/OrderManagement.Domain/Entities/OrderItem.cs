
namespace OrderManagement.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; private set; }

    public Guid ProductId { get; private set; }

    public int Quantity { get; private set; }

    public decimal UnitPrice { get; private set; }

    public decimal TotalPrice => Quantity * UnitPrice;

    internal OrderItem(
        Guid productId,
        int quantity,
        decimal unitPrice)
    {
        if (productId == Guid.Empty)
            throw new ArgumentException(
                "Product ID cannot be empty.");

        if (quantity <= 0)
            throw new ArgumentException(
                "Quantity must be greater than zero.");

        if (unitPrice < 0)
            throw new ArgumentException(
                "Unit price cannot be negative.");

        Id = Guid.NewGuid();
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }
}
