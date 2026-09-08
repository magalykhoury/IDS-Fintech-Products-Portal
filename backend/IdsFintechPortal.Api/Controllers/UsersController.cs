using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdsFintechPortal.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    // --------------------------------------------------
    // GET ALL USERS
    // --------------------------------------------------

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userRepository.GetAllAsync();

        return Ok(users);
    }

    // --------------------------------------------------
    // GET USER BY ID
    // --------------------------------------------------

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user is null)
        {
            return NotFound(new
            {
                message = $"User with ID {id} does not exist."
            });
        }

        var roleName =
            await _userRepository.GetRoleNameAsync(user.RoleId);

        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email,
            user.RoleId,
            Role = roleName,
            user.IsActive,
            user.CreatedAt,
            user.UpdatedAt
        });
    }

    // --------------------------------------------------
    // CREATE USER
    // --------------------------------------------------

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateUserRequest request)
    {
        var roleExists =
            await _userRepository.RoleExistsAsync(request.RoleId);

        if (!roleExists)
        {
            return BadRequest(new
            {
                message =
                    $"Role with ID {request.RoleId} does not exist."
            });
        }

        var usernameExists =
            await _userRepository.UsernameExistsAsync(
                request.Username
            );

        if (usernameExists)
        {
            return BadRequest(new
            {
                message = "Username is already in use."
            });
        }

        var emailExists =
            await _userRepository.EmailExistsAsync(
                request.Email
            );

        if (emailExists)
        {
            return BadRequest(new
            {
                message = "Email is already in use."
            });
        }

        var passwordHash =
            BCrypt.Net.BCrypt.HashPassword(
                request.Password
            );

        var id =
            await _userRepository.CreateAsync(
                request.Username,
                request.Email,
                passwordHash,
                request.RoleId
            );

        return Created(
            $"/api/users/{id}",
            new
            {
                id,
                request.Username,
                request.Email,
                request.RoleId
            }
        );
    }

    // --------------------------------------------------
    // UPDATE USER ROLE
    // --------------------------------------------------

    [HttpPut("{id:int}/role/{roleId:int}")]
    public async Task<IActionResult> UpdateRole(
        int id,
        int roleId)
    {
        var user =
            await _userRepository.GetByIdAsync(id);

        if (user is null)
        {
            return NotFound(new
            {
                message = $"User with ID {id} does not exist."
            });
        }

        var roleExists =
            await _userRepository.RoleExistsAsync(roleId);

        if (!roleExists)
        {
            return BadRequest(new
            {
                message = $"Role with ID {roleId} does not exist."
            });
        }

        var updated =
            await _userRepository.UpdateRoleAsync(
                id,
                roleId
            );

        if (!updated)
        {
            return BadRequest(new
            {
                message = "User role could not be updated."
            });
        }

        var roleName =
            await _userRepository.GetRoleNameAsync(roleId);

        return Ok(new
        {
            message = "User role updated successfully.",
            userId = id,
            roleId,
            role = roleName
        });
    }

    // --------------------------------------------------
    // ACTIVATE / DEACTIVATE USER
    // --------------------------------------------------

    [HttpPut("{id:int}/status/{isActive:bool}")]
    public async Task<IActionResult> UpdateActiveStatus(
        int id,
        bool isActive)
    {
        var user =
            await _userRepository.GetByIdAsync(id);

        if (user is null)
        {
            return NotFound(new
            {
                message = $"User with ID {id} does not exist."
            });
        }

        var updated =
            await _userRepository.UpdateActiveStatusAsync(
                id,
                isActive
            );

        if (!updated)
        {
            return BadRequest(new
            {
                message = "User status could not be updated."
            });
        }

        return Ok(new
        {
            message = isActive
                ? "User activated successfully."
                : "User deactivated successfully.",

            userId = id,
            isActive
        });
    }
}