using Microsoft.AspNetCore.Mvc;
using ProductVersioningAPI.DTOs;
using ProductVersioningAPI.Models;

    using Asp.Versioning;
namespace ProductVersioningAPI.Controllers
{
    [ApiController]
    [ApiVersion("2.0")]
    [Route("api/v{version:apiVersion}/products")]
    [ApiExplorerSettings(GroupName = "Product V2")]

    public class ProductsV2Controller : ControllerBase
    {
        // this other list for the version 2 
        // its private since each controller has own list 
        // static since all request share the same list
        // readonly since we dont want to change the list reference
        private static readonly List<Product> products = new()
        {
            new Product
            {
                Id = 1,
                Name = "Laptop",
                Price = 1200,
                Description = "Gaming Laptop",
                Stock = 15
            },

            new Product
            {
                Id = 2,
                Name = "Phone",
                Price = 800,
                Description = "Smart Phone",
                Stock = 20
            }
        };


        // get all items 
        [HttpGet]
        public IActionResult GetProducts()
        {
            var result = products.Select(p => new ProductV2Dto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Description = p.Description,
                Stock = p.Stock
            });


            return Ok(result);
        }



        // get items by id
        [HttpGet("{id}")]
        public IActionResult GetProduct(int id)
        {
            var product = products.FirstOrDefault(p => p.Id == id);


            if (product == null)
            {
                return NotFound();
            }


            var result = new ProductV2Dto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Description = product.Description,
                Stock = product.Stock
            };


            return Ok(result);
        }

        [HttpPost]
        public IActionResult CreateProduct(CreateProductDto dto)
        {
            var product = new Product
            {
                Id = products.Count + 1,
                Name = dto.Name,
                Price = dto.Price,
                Description = dto.Description,
                Stock = dto.Stock
            };


            products.Add(product);


            return CreatedAtAction(
                nameof(GetProduct),
                new { id = product.Id },
                product
            );
        }

    }
}
