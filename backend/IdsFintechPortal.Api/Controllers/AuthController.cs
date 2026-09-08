using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using IdsFintechPortal.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace IdsFintechPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly JwtService _jwtService;

    public AuthController(
        IUserRepository userRepository,
        JwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user =
            await _userRepository.GetByUsernameAsync(request.Username);

        if (user is null)
        {
            return Unauthorized(new
            {
                message = "Invalid username or password."
            });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new
            {
                message = "This user account is inactive."
            });
        }

        var passwordValid =
            BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash
            );

        if (!passwordValid)
        {
            return Unauthorized(new
            {
                message = "Invalid username or password."
            });
        }

        var roleName =
            await _userRepository.GetRoleNameAsync(user.RoleId);

        if (roleName is null)
        {
            return Unauthorized(new
            {
                message = "User role could not be resolved."
            });
        }

        var response =
            _jwtService.GenerateToken(user, roleName);

        return Ok(response);
    }
}