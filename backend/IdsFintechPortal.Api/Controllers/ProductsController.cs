using System.Security.Claims;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using IdsFintechPortal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdsFintechPortal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepository;
    private readonly IProductTechnologyRepository _productTechnologyRepository;
    private readonly IProductResponsibilityRepository _productResponsibilityRepository;
    private readonly ITeamMemberRepository _teamMemberRepository;
    private readonly NotificationService _notificationService;

    public ProductsController(
        IProductRepository productRepository,
        IProductTechnologyRepository productTechnologyRepository,
        IProductResponsibilityRepository productResponsibilityRepository,
        ITeamMemberRepository teamMemberRepository,
        NotificationService notificationService)
    {
        _productRepository = productRepository;
        _productTechnologyRepository = productTechnologyRepository;
        _productResponsibilityRepository = productResponsibilityRepository;
        _teamMemberRepository = teamMemberRepository;
        _notificationService = notificationService;
    }

    // --------------------------------------------------
    // GET ALL PRODUCTS
    // --------------------------------------------------

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products =
            await _productRepository.GetAllAsync();

        return Ok(products);
    }

    // --------------------------------------------------
    // GET PRODUCT BY ID
    // --------------------------------------------------

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product =
            await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {id} does not exist."
            });
        }

        return Ok(product);
    }

    // --------------------------------------------------
    // CREATE PRODUCT
    // --------------------------------------------------

    [Authorize(Policy = "ProductManage")]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateProductRequest request)
    {
        var id =
            await _productRepository.CreateAsync(request);

        var product =
            await _productRepository.GetByIdAsync(id);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            product
        );
    }

    // --------------------------------------------------
    // UPDATE PRODUCT
    // --------------------------------------------------

    [Authorize(Policy = "ProductManage")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateProductRequest request)
    {
        var existingProduct =
            await _productRepository.GetByIdAsync(id);

        if (existingProduct is null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {id} does not exist."
            });
        }

        var updated =
            await _productRepository.UpdateAsync(
                id,
                request
            );

        if (!updated)
        {
            return NotFound();
        }

        var product =
            await _productRepository.GetByIdAsync(id);

        if (product is not null && !string.Equals(
                existingProduct.LifecycleStatus,
                product.LifecycleStatus,
                StringComparison.OrdinalIgnoreCase))
        {
            await _notificationService.ProductLifecycleChangedAsync(
                product.Id,
                product.Name,
                existingProduct.LifecycleStatus,
                product.LifecycleStatus,
                GetUserId());
        }

        return Ok(product);
    }

    // --------------------------------------------------
    // DELETE PRODUCT
    // --------------------------------------------------

    [Authorize(Policy = "ProductManage")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product =
            await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {id} does not exist."
            });
        }

        var deleted =
            await _productRepository.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    // --------------------------------------------------
    // GET PRODUCT TECHNOLOGIES
    // --------------------------------------------------

    [HttpGet("{id:int}/technologies")]
    public async Task<IActionResult> GetTechnologies(
        int id)
    {
        var product =
            await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {id} does not exist."
            });
        }

        var technologies =
            await _productTechnologyRepository
                .GetByProductIdAsync(id);

        return Ok(technologies);
    }

    // --------------------------------------------------
    // ADD TECHNOLOGY TO PRODUCT
    // --------------------------------------------------

    [Authorize(Policy = "ProductManage")]
    [HttpPost(
        "{id:int}/technologies/{technologyId:int}"
    )]
    public async Task<IActionResult> AddTechnology(
        int id,
        int technologyId)
    {
        var product =
            await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {id} does not exist."
            });
        }

        var added =
            await _productTechnologyRepository.AddAsync(
                id,
                technologyId
            );

        if (!added)
        {
            return BadRequest(new
            {
                message =
                    "Technology is already assigned to this product or could not be added."
            });
        }

        var technologies =
            await _productTechnologyRepository
                .GetByProductIdAsync(id);

        return Ok(technologies);
    }

    // --------------------------------------------------
    // REMOVE TECHNOLOGY FROM PRODUCT
    // --------------------------------------------------

    [Authorize(Policy = "ProductManage")]
    [HttpDelete(
        "{id:int}/technologies/{technologyId:int}"
    )]
    public async Task<IActionResult> RemoveTechnology(
        int id,
        int technologyId)
    {
        var product =
            await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {id} does not exist."
            });
        }

        var removed =
            await _productTechnologyRepository.RemoveAsync(
                id,
                technologyId
            );

        if (!removed)
        {
            return NotFound(new
            {
                message =
                    $"Technology {technologyId} is not assigned to product {id}."
            });
        }

        return NoContent();
    }

    // --------------------------------------------------
    // GET PRODUCT TEAM / RESPONSIBILITIES
    // --------------------------------------------------

    [HttpGet("{id:int}/team")]
    public async Task<IActionResult> GetTeam(
        int id)
    {
        var product =
            await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {id} does not exist."
            });
        }

        var responsibilities =
            await _productResponsibilityRepository
                .GetByProductIdAsync(id);

        return Ok(responsibilities);
    }

    // --------------------------------------------------
    // ADD TEAM MEMBER RESPONSIBILITY TO PRODUCT
    // --------------------------------------------------

    [Authorize(Policy = "ProductManage")]
    [HttpPost("{id:int}/team")]
    public async Task<IActionResult> AddTeamMember(
        int id,
        CreateProductResponsibilityRequest request)
    {
        if (request.ProductId != id)
        {
            return BadRequest(new
            {
                message =
                    "Product ID in the URL must match ProductId in the request."
            });
        }

        var product =
            await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {id} does not exist."
            });
        }

        var teamMember =
            await _teamMemberRepository
                .GetByIdAsync(request.TeamMemberId);

        if (teamMember is null)
        {
            return BadRequest(new
            {
                message =
                    $"Team member with ID {request.TeamMemberId} does not exist."
            });
        }

        await _productResponsibilityRepository
            .CreateAsync(request);

        var responsibilities =
            await _productResponsibilityRepository
                .GetByProductIdAsync(id);

        return Ok(responsibilities);
    }

    // --------------------------------------------------
    // UPDATE PRODUCT TEAM RESPONSIBILITY
    // --------------------------------------------------

    [Authorize(Policy = "ProductManage")]
    [HttpPut(
        "{id:int}/team/{responsibilityId:int}"
    )]
    public async Task<IActionResult> UpdateTeamMember(
        int id,
        int responsibilityId,
        CreateProductResponsibilityRequest request)
    {
        if (request.ProductId != id)
        {
            return BadRequest(new
            {
                message =
                    "Product ID in the URL must match ProductId in the request."
            });
        }

        var product =
            await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {id} does not exist."
            });
        }

        var teamMember =
            await _teamMemberRepository
                .GetByIdAsync(request.TeamMemberId);

        if (teamMember is null)
        {
            return BadRequest(new
            {
                message =
                    $"Team member with ID {request.TeamMemberId} does not exist."
            });
        }

        var existingResponsibilities =
            await _productResponsibilityRepository
                .GetByProductIdAsync(id);

        var existingResponsibility =
            existingResponsibilities.FirstOrDefault(
                responsibility =>
                    responsibility.Id ==
                    responsibilityId
            );

        if (existingResponsibility is null)
        {
            return NotFound(new
            {
                message =
                    $"Product responsibility with ID {responsibilityId} does not exist for product {id}."
            });
        }

        var updated =
            await _productResponsibilityRepository
                .UpdateAsync(
                    responsibilityId,
                    request
                );

        if (!updated)
        {
            return NotFound(new
            {
                message =
                    $"Product responsibility with ID {responsibilityId} could not be updated."
            });
        }

        var responsibilities =
            await _productResponsibilityRepository
                .GetByProductIdAsync(id);

        return Ok(responsibilities);
    }

    // --------------------------------------------------
    // REMOVE PRODUCT RESPONSIBILITY
    // --------------------------------------------------

    [Authorize(Policy = "ProductManage")]
    [HttpDelete(
        "{id:int}/team/{responsibilityId:int}"
    )]
    public async Task<IActionResult> RemoveTeamMember(
        int id,
        int responsibilityId)
    {
        var product =
            await _productRepository.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {id} does not exist."
            });
        }

        var existingResponsibilities =
            await _productResponsibilityRepository
                .GetByProductIdAsync(id);

        var existingResponsibility =
            existingResponsibilities.FirstOrDefault(
                responsibility =>
                    responsibility.Id ==
                    responsibilityId
            );

        if (existingResponsibility is null)
        {
            return NotFound(new
            {
                message =
                    $"Product responsibility with ID {responsibilityId} does not exist for product {id}."
            });
        }

        var deleted =
            await _productResponsibilityRepository
                .DeleteAsync(responsibilityId);

        if (!deleted)
        {
            return NotFound(new
            {
                message =
                    $"Product responsibility with ID {responsibilityId} does not exist."
            });
        }

        return NoContent();
    }

    private int GetUserId() =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;
}
