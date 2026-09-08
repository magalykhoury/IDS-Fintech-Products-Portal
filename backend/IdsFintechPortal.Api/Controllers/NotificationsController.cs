using System.Security.Claims;
using IdsFintechPortal.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdsFintechPortal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationsController(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _notificationRepository.GetForUserAsync(GetUserId(), false));

    [HttpGet("unread")]
    public async Task<IActionResult> GetUnread() => Ok(await _notificationRepository.GetForUserAsync(GetUserId(), true));

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount() => Ok(new
    {
        count = await _notificationRepository.CountUnreadAsync(GetUserId())
    });

    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        return await _notificationRepository.MarkReadAsync(id, GetUserId()) ? NoContent() : NotFound();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        await _notificationRepository.MarkAllReadAsync(GetUserId());
        return NoContent();
    }

    private int GetUserId() => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;
}
