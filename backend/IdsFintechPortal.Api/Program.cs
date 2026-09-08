using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.Repositories;
using IdsFintechPortal.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Logging.EventLog;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Event Log is enabled by default on Windows, but this app is normally run
// as a developer process without permission to write that log. Preventing
// that provider from throwing keeps the actual API error observable in the
// console and in the HTTP response.
if (OperatingSystem.IsWindows())
{
    builder.Logging.AddFilter<EventLogLoggerProvider>(null, LogLevel.None);
}

// --------------------------------------------------
// SERVICES
// --------------------------------------------------

builder.Services.AddOpenApi();

// Database connection factory
builder.Services.AddSingleton<DbConnectionFactory>();

// Repositories
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IDeploymentRepository, DeploymentRepository>();
builder.Services.AddScoped<IEnvironmentRepository, EnvironmentRepository>();
builder.Services.AddScoped<IServerRepository, ServerRepository>();
builder.Services.AddScoped<IProductModuleRepository, ProductModuleRepository>();
builder.Services.AddScoped<ITechnologyRepository, TechnologyRepository>();
builder.Services.AddScoped<IProductTechnologyRepository, ProductTechnologyRepository>();
builder.Services.AddScoped<IDeploymentModuleRepository, DeploymentModuleRepository>();
builder.Services.AddScoped<ITeamMemberRepository, TeamMemberRepository>();
builder.Services.AddScoped<IProductResponsibilityRepository, ProductResponsibilityRepository>();
builder.Services.AddScoped<IDeploymentResponsibilityRepository, DeploymentResponsibilityRepository>();
builder.Services.AddScoped<IRepositoryRepository, RepositoryRepository>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IApprovalRepository, ApprovalRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IPortalKnowledgeRepository, PortalKnowledgeRepository>();

// JWT service
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<PortalIntelligenceService>();
builder.Services.AddHttpClient<IAiAnswerProvider, OpenAiAnswerProvider>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(45);
});

// --------------------------------------------------
// CORS
// --------------------------------------------------

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>()
            ?? throw new InvalidOperationException(
                "At least one CORS origin must be configured."
            );

        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Controllers
builder.Services.AddControllers();


// --------------------------------------------------
// JWT AUTHENTICATION
// --------------------------------------------------

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "JWT Key is missing."
    );

var jwtIssuer =
    builder.Configuration["Jwt:Issuer"];

var jwtAudience =
    builder.Configuration["Jwt:Audience"];

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtKey
                        )
                    ),

                ClockSkew = TimeSpan.Zero
            };
    });


// --------------------------------------------------
// AUTHORIZATION POLICIES
// --------------------------------------------------

builder.Services.AddAuthorization(options =>
{
    // Admin-only features such as user management
    options.AddPolicy(
        "AdminOnly",
        policy =>
        {
            policy.RequireRole(
                "Admin"
            );
        }
    );

    // General business-data management
    // Clients, team members, etc.
    options.AddPolicy(
        "PortalWrite",
        policy =>
        {
            policy.RequireRole(
                "Admin",
                "Management"
            );
        }
    );

    // Product-related management
    options.AddPolicy(
        "ProductManage",
        policy =>
        {
            policy.RequireRole(
                "Admin",
                "Management",
                "ProductOwner",
                "Developer"
            );
        }
    );

    // Deployment-related management
    options.AddPolicy(
        "DeploymentManage",
        policy =>
        {
            policy.RequireRole(
                "Admin",
                "Management",
                "ProductOwner",
                "Developer",
                "Implementation"
            );
        }
    );
});

var app = builder.Build();


// --------------------------------------------------
// HTTP PIPELINE
// --------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// The HTTP development profile intentionally exposes only HTTP. Redirecting
// without a configured HTTPS endpoint makes requests fail before controllers
// run, so only enable the middleware when an HTTPS endpoint is present.
var hasHttpsEndpoint = app.Urls.Any(url =>
    Uri.TryCreate(url, UriKind.Absolute, out var uri)
    && uri.Scheme.Equals(Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase));

if (hasHttpsEndpoint)
{
    app.UseHttpsRedirection();
}

// Allow React frontend
app.UseCors("Frontend");

// Authentication must come before authorization
app.UseAuthentication();
app.UseAuthorization();


// --------------------------------------------------
// CONTROLLERS
// --------------------------------------------------

app.MapControllers();

app.Run();
