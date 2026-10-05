using Microsoft.AspNetCore.Mvc;
using ProductVersioningAPI.DTOs;
using ProductVersioningAPI.Models;
using Asp.Versioning;
namespace ProductVersioningAPI.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/products")]
    [ApiExplorerSettings(GroupName = "Product V1")]
    public class ProductsV1Controller : ControllerBase
    {

        // create a demo list of products
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

        // normal get items 
        [HttpGet]
        public IActionResult GetProducts()
        {
            var result = products.Select(p => new ProductV1Dto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price
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


            var result = new ProductV1Dto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price
            };


            return Ok(result);
        }
    }
}

