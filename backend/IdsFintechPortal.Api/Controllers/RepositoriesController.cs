using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace IdsFintechPortal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RepositoriesController : ControllerBase
{
    private readonly IRepositoryRepository _repositoryRepository;
    private readonly IProductRepository _productRepository;

    public RepositoriesController(
        IRepositoryRepository repositoryRepository,
        IProductRepository productRepository)
    {
        _repositoryRepository = repositoryRepository;
        _productRepository = productRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var repositories =
            await _repositoryRepository.GetAllAsync();

        return Ok(repositories);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var repository =
            await _repositoryRepository.GetByIdAsync(id);

        if (repository is null)
        {
            return NotFound(new
            {
                message = $"Repository with ID {id} does not exist."
            });
        }

        return Ok(repository);
    }

    [HttpGet("product/{productId:int}")]
    public async Task<IActionResult> GetByProductId(int productId)
    {
        var product =
            await _productRepository.GetByIdAsync(productId);

        if (product is null)
        {
            return NotFound(new
            {
                message = $"Product with ID {productId} does not exist."
            });
        }

        var repositories =
            await _repositoryRepository.GetByProductIdAsync(productId);

        return Ok(repositories);
    }

    [Authorize(Policy = "ProductManage")]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateRepositoryRequest request)
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
            await _repositoryRepository.CreateAsync(request);

        var repository =
            await _repositoryRepository.GetByIdAsync(id);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            repository
        );
    }

    [Authorize(Policy = "ProductManage")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateRepositoryRequest request)
    {
        var existing =
            await _repositoryRepository.GetByIdAsync(id);

        if (existing is null)
        {
            return NotFound(new
            {
                message = $"Repository with ID {id} does not exist."
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
            await _repositoryRepository.UpdateAsync(id, request);

        if (!updated)
        {
            return NotFound();
        }

        var repository =
            await _repositoryRepository.GetByIdAsync(id);

        return Ok(repository);
    }

    [Authorize(Policy = "ProductManage")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing =
            await _repositoryRepository.GetByIdAsync(id);

        if (existing is null)
        {
            return NotFound(new
            {
                message = $"Repository with ID {id} does not exist."
            });
        }

        var deleted =
            await _repositoryRepository.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
