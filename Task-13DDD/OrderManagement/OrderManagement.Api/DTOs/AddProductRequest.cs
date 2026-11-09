namespace OrderManagement.Api.DTOs;

public record AddProductRequest(
    Guid ProductId,
    int Quantity,
    decimal UnitPrice
);