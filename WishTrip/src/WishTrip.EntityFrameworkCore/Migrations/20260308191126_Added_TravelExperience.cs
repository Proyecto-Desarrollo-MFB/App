using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WishTrip.Migrations
{
    /// <inheritdoc />
    public partial class Added_TravelExperience : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Calificaciones",
                table: "Calificaciones");

            migrationBuilder.RenameTable(
                name: "Calificaciones",
                newName: "AppCalificaciones");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppCalificaciones",
                table: "AppCalificaciones",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "AppTravelExperiences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DestinationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Review = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    IsFavorite = table.Column<bool>(type: "bit", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTravelExperiences", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppTravelExperiences");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppCalificaciones",
                table: "AppCalificaciones");

            migrationBuilder.RenameTable(
                name: "AppCalificaciones",
                newName: "Calificaciones");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Calificaciones",
                table: "Calificaciones",
                column: "Id");
        }
    }
}
