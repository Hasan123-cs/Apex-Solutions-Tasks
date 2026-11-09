namespace OrderManagement.Api.DTOs;

public record OrderResponse(
    Guid Id,
    string Status,
    decimal TotalAmount,
    List<OrderItemResponse> Items
);