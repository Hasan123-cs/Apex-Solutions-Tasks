namespace OrderManagement.Api.DTOs;

public record OrderItemResponse(
    Guid Id,
    Guid ProductId,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);