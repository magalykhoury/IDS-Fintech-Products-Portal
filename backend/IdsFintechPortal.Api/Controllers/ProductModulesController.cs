using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace IdsFintechPortal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductModulesController : ControllerBase
{
    private readonly IProductModuleRepository _productModuleRepository;
    private readonly IProductRepository _productRepository;

    public ProductModulesController(
        IProductModuleRepository productModuleRepository,
        IProductRepository productRepository)
    {
        _productModuleRepository = productModuleRepository;
        _productRepository = productRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var modules = await _productModuleRepository.GetAllAsync();
        return Ok(modules);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var module = await _productModuleRepository.GetByIdAsync(id);

        if (module is null)
        {
            return NotFound(new
            {
                message = $"Product module with ID {id} does not exist."
            });
        }

        return Ok(module);
    }

    [HttpGet("product/{productId:int}")]
    public async Task<IActionResult> GetByProductId(int productId)
    {
        var product = await _productRepository.GetByIdAsync(productId);

        if (product is null)
        {
            return NotFound(new
            {
                message = $"Product with ID {productId} does not exist."
            });
        }

        var modules =
            await _productModuleRepository.GetByProductIdAsync(productId);

        return Ok(modules);
    }

    [Authorize(Policy = "ProductManage")]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateProductModuleRequest request)
    {
        var product =
            await _productRepository.GetByIdAsync(request.ProductId);

        if (product is null)
        {
            return BadRequest(new
            {
                message =
                    $"Product with ID {request.ProductId} does not exist."
            });
        }

        var id =
            await _productModuleRepository.CreateAsync(request);

        var module =
            await _productModuleRepository.GetByIdAsync(id);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            module
        );
    }

    [Authorize(Policy = "ProductManage")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateProductModuleRequest request)
    {
        var existingModule =
            await _productModuleRepository.GetByIdAsync(id);

        if (existingModule is null)
        {
            return NotFound(new
            {
                message = $"Product module with ID {id} does not exist."
            });
        }

        var product =
            await _productRepository.GetByIdAsync(request.ProductId);

        if (product is null)
        {
            return BadRequest(new
            {
                message =
                    $"Product with ID {request.ProductId} does not exist."
            });
        }

        var updated =
            await _productModuleRepository.UpdateAsync(id, request);

        if (!updated)
        {
            return NotFound();
        }

        var module =
            await _productModuleRepository.GetByIdAsync(id);

        return Ok(module);
    }

    [Authorize(Policy = "ProductManage")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var module =
            await _productModuleRepository.GetByIdAsync(id);

        if (module is null)
        {
            return NotFound(new
            {
                message = $"Product module with ID {id} does not exist."
            });
        }

        var deleted =
            await _productModuleRepository.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
