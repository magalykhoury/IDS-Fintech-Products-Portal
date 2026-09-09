-- IDS Fintech Products Portal - complete schema
-- Generated from the local SQL Server schema and reviewed on 2026-09-08.
-- Run against a new or empty database. This script never drops objects.

-- Supply the database name with sqlcmd, for example:
-- sqlcmd -S . -E -C -b -Q ":r database\schema.sql" -v DatabaseName=IdsFintechPortal

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ARITHABORT ON;
GO

IF DB_ID(N'$(DatabaseName)') IS NULL
BEGIN
    DECLARE @CreateDatabase nvarchar(500) = N'CREATE DATABASE [' + REPLACE(N'$(DatabaseName)', N']', N']]') + N']';
    EXEC (@CreateDatabase);
END;
GO

USE [$(DatabaseName)];
GO

CREATE TABLE dbo.Roles
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Roles PRIMARY KEY CLUSTERED,
    Name nvarchar(100) NOT NULL,
    Description nvarchar(255) NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Roles_CreatedAt DEFAULT (sysutcdatetime()),
    CONSTRAINT UQ_Roles_Name UNIQUE (Name)
);
GO

CREATE TABLE dbo.Users
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY CLUSTERED,
    Username nvarchar(100) NOT NULL,
    Email nvarchar(255) NOT NULL,
    PasswordHash nvarchar(500) NOT NULL,
    RoleId int NOT NULL,
    IsActive bit NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT (1),
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (sysutcdatetime()),
    UpdatedAt datetime2(7) NULL,
    CONSTRAINT UQ_Users_Username UNIQUE (Username),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id)
);
GO

CREATE TABLE dbo.Products
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Products PRIMARY KEY CLUSTERED,
    Name nvarchar(150) NOT NULL,
    Description nvarchar(1000) NULL,
    BusinessPurpose nvarchar(1000) NULL,
    LifecycleStatus nvarchar(50) NOT NULL,
    CurrentVersion nvarchar(50) NULL,
    SupportedMarkets nvarchar(255) NULL,
    Criticality nvarchar(50) NULL,
    Notes nvarchar(max) NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT (sysutcdatetime()),
    UpdatedAt datetime2(7) NULL,
    CONSTRAINT UQ_Products_Name UNIQUE (Name)
);
GO

CREATE TABLE dbo.Clients
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Clients PRIMARY KEY CLUSTERED,
    CompanyName nvarchar(200) NOT NULL,
    Country nvarchar(100) NULL,
    ContactName nvarchar(150) NULL,
    ContactEmail nvarchar(255) NULL,
    ContactPhone nvarchar(50) NULL,
    Status nvarchar(50) NOT NULL,
    Notes nvarchar(max) NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Clients_CreatedAt DEFAULT (sysutcdatetime()),
    UpdatedAt datetime2(7) NULL,
    CONSTRAINT UQ_Clients_CompanyName UNIQUE (CompanyName)
);
GO

CREATE TABLE dbo.TeamMembers
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_TeamMembers PRIMARY KEY CLUSTERED,
    FullName nvarchar(150) NOT NULL,
    JobTitle nvarchar(150) NULL,
    Department nvarchar(150) NULL,
    Email nvarchar(255) NULL,
    Status nvarchar(50) NOT NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_TeamMembers_CreatedAt DEFAULT (sysutcdatetime()),
    UpdatedAt datetime2(7) NULL
);
GO

CREATE TABLE dbo.Technologies
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Technologies PRIMARY KEY CLUSTERED,
    Name nvarchar(100) NOT NULL,
    Description nvarchar(500) NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Technologies_CreatedAt DEFAULT (sysutcdatetime()),
    CONSTRAINT UQ_Technologies_Name UNIQUE (Name)
);
GO

CREATE TABLE dbo.Deployments
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Deployments PRIMARY KEY CLUSTERED,
    ClientId int NOT NULL,
    ProductId int NOT NULL,
    ProductVersion nvarchar(50) NOT NULL,
    GoLiveDate date NULL,
    Status nvarchar(50) NOT NULL,
    SupportTier nvarchar(50) NULL,
    ClientSpecificNotes nvarchar(max) NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Deployments_CreatedAt DEFAULT (sysutcdatetime()),
    UpdatedAt datetime2(7) NULL,
    CONSTRAINT FK_Deployments_Clients FOREIGN KEY (ClientId) REFERENCES dbo.Clients(Id),
    CONSTRAINT FK_Deployments_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id)
);
GO

CREATE TABLE dbo.ProductModules
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_ProductModules PRIMARY KEY CLUSTERED,
    ProductId int NOT NULL,
    Name nvarchar(150) NOT NULL,
    Description nvarchar(1000) NULL,
    Status nvarchar(50) NOT NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_ProductModules_CreatedAt DEFAULT (sysutcdatetime()),
    UpdatedAt datetime2(7) NULL,
    CONSTRAINT UQ_ProductModules_Product_Name UNIQUE (ProductId, Name),
    CONSTRAINT FK_ProductModules_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.ProductTechnologies
(
    ProductId int NOT NULL,
    TechnologyId int NOT NULL,
    CONSTRAINT PK_ProductTechnologies PRIMARY KEY CLUSTERED (ProductId, TechnologyId),
    CONSTRAINT FK_ProductTechnologies_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ProductTechnologies_Technologies FOREIGN KEY (TechnologyId) REFERENCES dbo.Technologies(Id)
);
GO

CREATE TABLE dbo.Environments
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Environments PRIMARY KEY CLUSTERED,
    DeploymentId int NOT NULL,
    Name nvarchar(100) NOT NULL,
    Type nvarchar(50) NOT NULL,
    Purpose nvarchar(500) NULL,
    ApplicationUrl nvarchar(500) NULL,
    DatabaseInformation nvarchar(500) NULL,
    MonitoringUrl nvarchar(500) NULL,
    AccessInstructions nvarchar(1000) NULL,
    Notes nvarchar(max) NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Environments_CreatedAt DEFAULT (sysutcdatetime()),
    UpdatedAt datetime2(7) NULL,
    CONSTRAINT UQ_Environments_Deployment_Name UNIQUE (DeploymentId, Name),
    CONSTRAINT FK_Environments_Deployments FOREIGN KEY (DeploymentId) REFERENCES dbo.Deployments(Id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.Servers
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Servers PRIMARY KEY CLUSTERED,
    EnvironmentId int NOT NULL,
    ServerName nvarchar(150) NOT NULL,
    Hostname nvarchar(255) NULL,
    IpAddress nvarchar(45) NULL,
    ServerType nvarchar(100) NULL,
    OperatingSystem nvarchar(150) NULL,
    Purpose nvarchar(500) NULL,
    AccessMethod nvarchar(100) NULL,
    AccessReference nvarchar(500) NULL,
    Notes nvarchar(max) NULL,
    IsActive bit NOT NULL CONSTRAINT DF_Servers_IsActive DEFAULT (1),
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Servers_CreatedAt DEFAULT (sysutcdatetime()),
    UpdatedAt datetime2(7) NULL,
    CONSTRAINT UQ_Servers_Environment_ServerName UNIQUE (EnvironmentId, ServerName),
    CONSTRAINT FK_Servers_Environments FOREIGN KEY (EnvironmentId) REFERENCES dbo.Environments(Id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.Repositories
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Repositories PRIMARY KEY CLUSTERED,
    ProductId int NOT NULL,
    Name nvarchar(150) NOT NULL,
    RepositoryUrl nvarchar(500) NOT NULL,
    MainBranch nvarchar(100) NULL,
    Description nvarchar(500) NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Repositories_CreatedAt DEFAULT (sysutcdatetime()),
    UpdatedAt datetime2(7) NULL,
    CONSTRAINT UQ_Repositories_Product_Name UNIQUE (ProductId, Name),
    CONSTRAINT FK_Repositories_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.Documents
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Documents PRIMARY KEY CLUSTERED,
    ProductId int NOT NULL,
    Name nvarchar(200) NOT NULL,
    DocumentType nvarchar(100) NOT NULL,
    Description nvarchar(1000) NULL,
    UrlOrFileReference nvarchar(1000) NOT NULL,
    LastUpdatedDate date NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Documents_CreatedAt DEFAULT (sysutcdatetime()),
    UpdatedAt datetime2(7) NULL,
    CONSTRAINT UQ_Documents_Product_Name UNIQUE (ProductId, Name),
    CONSTRAINT FK_Documents_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.ProductResponsibilities
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_ProductResponsibilities PRIMARY KEY CLUSTERED,
    ProductId int NOT NULL,
    TeamMemberId int NOT NULL,
    Responsibility nvarchar(150) NOT NULL,
    Description nvarchar(500) NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_ProductResponsibilities_CreatedAt DEFAULT (sysutcdatetime()),
    CONSTRAINT UQ_ProductResponsibilities UNIQUE (ProductId, TeamMemberId, Responsibility),
    CONSTRAINT FK_ProductResponsibilities_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ProductResponsibilities_TeamMembers FOREIGN KEY (TeamMemberId) REFERENCES dbo.TeamMembers(Id)
);
GO

CREATE TABLE dbo.DeploymentModules
(
    DeploymentId int NOT NULL,
    ProductModuleId int NOT NULL,
    CONSTRAINT PK_DeploymentModules PRIMARY KEY CLUSTERED (DeploymentId, ProductModuleId),
    CONSTRAINT FK_DeploymentModules_Deployments FOREIGN KEY (DeploymentId) REFERENCES dbo.Deployments(Id) ON DELETE CASCADE,
    CONSTRAINT FK_DeploymentModules_ProductModules FOREIGN KEY (ProductModuleId) REFERENCES dbo.ProductModules(Id)
);
GO

CREATE TABLE dbo.DeploymentResponsibilities
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_DeploymentResponsibilities PRIMARY KEY CLUSTERED,
    DeploymentId int NOT NULL,
    TeamMemberId int NOT NULL,
    Responsibility nvarchar(150) NOT NULL,
    Description nvarchar(500) NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_DeploymentResponsibilities_CreatedAt DEFAULT (sysutcdatetime()),
    CONSTRAINT UQ_DeploymentResponsibilities UNIQUE (DeploymentId, TeamMemberId, Responsibility),
    CONSTRAINT FK_DeploymentResponsibilities_Deployments FOREIGN KEY (DeploymentId) REFERENCES dbo.Deployments(Id) ON DELETE CASCADE,
    CONSTRAINT FK_DeploymentResponsibilities_TeamMembers FOREIGN KEY (TeamMemberId) REFERENCES dbo.TeamMembers(Id)
);
GO

CREATE TABLE dbo.AuditLogs
(
    Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AuditLogs PRIMARY KEY CLUSTERED,
    UserId int NULL,
    Action nvarchar(100) NOT NULL,
    EntityType nvarchar(100) NOT NULL,
    EntityId int NULL,
    Description nvarchar(1000) NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT (sysutcdatetime()),
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);
GO

CREATE TABLE dbo.ApprovalRequests
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_ApprovalRequests PRIMARY KEY CLUSTERED,
    EntityType nvarchar(50) NOT NULL,
    EntityId int NOT NULL,
    Title nvarchar(200) NOT NULL,
    Description nvarchar(1000) NULL,
    RequestedByUserId int NOT NULL,
    Status nvarchar(20) NOT NULL CONSTRAINT DF_ApprovalRequests_Status DEFAULT (N'Pending'),
    ReviewedByUserId int NULL,
    ReviewComment nvarchar(1000) NULL,
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_ApprovalRequests_CreatedAt DEFAULT (sysutcdatetime()),
    ReviewedAt datetime2(7) NULL,
    CONSTRAINT CK_ApprovalRequests_EntityType CHECK (EntityType IN (N'Deployment')),
    CONSTRAINT CK_ApprovalRequests_Status CHECK (Status IN (N'Pending', N'Approved', N'Rejected')),
    CONSTRAINT FK_ApprovalRequests_RequestedBy FOREIGN KEY (RequestedByUserId) REFERENCES dbo.Users(Id),
    CONSTRAINT FK_ApprovalRequests_ReviewedBy FOREIGN KEY (ReviewedByUserId) REFERENCES dbo.Users(Id)
);
GO

CREATE TABLE dbo.Notifications
(
    Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Notifications PRIMARY KEY CLUSTERED,
    UserId int NOT NULL,
    Type nvarchar(50) NOT NULL,
    Title nvarchar(200) NOT NULL,
    Message nvarchar(1000) NOT NULL,
    Link nvarchar(500) NULL,
    IsRead bit NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT (0),
    CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT (sysutcdatetime()),
    Category nvarchar(50) NOT NULL CONSTRAINT DF_Notifications_Category DEFAULT (N'General'),
    RelatedEntityType nvarchar(50) NULL,
    RelatedEntityId int NULL,
    ReadAt datetime2(7) NULL,
    CONSTRAINT CK_Notifications_RelatedEntityPair CHECK
        ((RelatedEntityType IS NULL AND RelatedEntityId IS NULL)
         OR (RelatedEntityType IS NOT NULL AND RelatedEntityId IS NOT NULL)),
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ARITHABORT ON;
GO

CREATE UNIQUE INDEX UX_ApprovalRequests_PendingDeployment
    ON dbo.ApprovalRequests (EntityType, EntityId)
    WHERE Status = N'Pending';
GO

CREATE INDEX IX_Notifications_UserUnread
    ON dbo.Notifications (UserId, IsRead, CreatedAt);
GO
