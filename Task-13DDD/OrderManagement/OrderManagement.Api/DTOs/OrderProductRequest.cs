namespace OrderManagement.Api.DTOs;

public record OrderProductRequest(
    Guid ProductId,
    int Quantity,
    decimal UnitPrice
);