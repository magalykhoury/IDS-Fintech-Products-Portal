using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace IdsFintechPortal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IProductRepository _productRepository;

    public DocumentsController(
        IDocumentRepository documentRepository,
        IProductRepository productRepository)
    {
        _documentRepository = documentRepository;
        _productRepository = productRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var documents =
            await _documentRepository.GetAllAsync();

        return Ok(documents);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var document =
            await _documentRepository.GetByIdAsync(id);

        if (document is null)
        {
            return NotFound(new
            {
                message = $"Document with ID {id} does not exist."
            });
        }

        return Ok(document);
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

        var documents =
            await _documentRepository.GetByProductIdAsync(productId);

        return Ok(documents);
    }

    [Authorize(Policy = "ProductManage")]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateDocumentRequest request)
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
            await _documentRepository.CreateAsync(request);

        var document =
            await _documentRepository.GetByIdAsync(id);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            document
        );
    }

    [Authorize(Policy = "ProductManage")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateDocumentRequest request)
    {
        var existing =
            await _documentRepository.GetByIdAsync(id);

        if (existing is null)
        {
            return NotFound(new
            {
                message = $"Document with ID {id} does not exist."
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
            await _documentRepository.UpdateAsync(id, request);

        if (!updated)
        {
            return NotFound();
        }

        var document =
            await _documentRepository.GetByIdAsync(id);

        return Ok(document);
    }

    [Authorize(Policy = "ProductManage")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing =
            await _documentRepository.GetByIdAsync(id);

        if (existing is null)
        {
            return NotFound(new
            {
                message = $"Document with ID {id} does not exist."
            });
        }

        var deleted =
            await _documentRepository.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
