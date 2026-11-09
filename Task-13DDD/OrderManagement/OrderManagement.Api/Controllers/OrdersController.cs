
using Microsoft.AspNetCore.Mvc;
using OrderManagement.Api.DTOs;
using OrderManagement.Application.Interfaces;
using OrderManagement.Domain.Entities;

namespace OrderManagement.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    // POST: api/orders
    [HttpPost]
    public async Task<IActionResult> CreateOrder(
        [FromBody] CreateOrderRequest request)
    {
        if (request.Items is null)
            return BadRequest(new { message = "Items are required." });

        try
        {
            var items = request.Items.Select(item => (
                item.ProductId,
                item.Quantity,
                item.UnitPrice
            ));

            var orderId =
                await _orderService.CreateOrderAsync(items);

            return CreatedAtAction(
                nameof(GetOrderById),
                new { id = orderId },
                new { id = orderId });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/orders/{id}/items
    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddProduct(
        Guid id,
        [FromBody] AddProductRequest request)
    {
        try
        {
            await _orderService.AddProductAsync(
                id,
                request.ProductId,
                request.Quantity,
                request.UnitPrice);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // POST: api/orders/{id}/confirm
    [HttpPost("{id:guid}/confirm")]
    public async Task<IActionResult> ConfirmOrder(Guid id)
    {
        try
        {
            await _orderService.ConfirmOrderAsync(id);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // GET: api/orders/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        var order =
            await _orderService.GetOrderByIdAsync(id);

        if (order is null)
            return NotFound(new { message = "Order not found." });

        return Ok(MapToResponse(order));
    }

    private static OrderResponse MapToResponse(Order order)
    {
        return new OrderResponse(
            order.Id,
            order.Status.ToString(),
            order.TotalAmount,
            order.Items.Select(item =>
                new OrderItemResponse(
                    item.Id,
                    item.ProductId,
                    item.Quantity,
                    item.UnitPrice,
                    item.TotalPrice
                )
            ).ToList()
        );
    }
}
