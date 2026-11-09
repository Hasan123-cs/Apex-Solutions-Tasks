namespace OrderManagement.Api.DTOs;

public record CreateOrderRequest(
    List<OrderProductRequest> Items
);