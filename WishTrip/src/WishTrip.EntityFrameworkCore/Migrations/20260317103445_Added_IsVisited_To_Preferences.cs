using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WishTrip.Migrations
{
    /// <inheritdoc />
    public partial class Added_IsVisited_To_Preferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsVisited",
                table: "AppUserDestinationPreferences",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsVisited",
                table: "AppUserDestinationPreferences");
        }
    }
}
