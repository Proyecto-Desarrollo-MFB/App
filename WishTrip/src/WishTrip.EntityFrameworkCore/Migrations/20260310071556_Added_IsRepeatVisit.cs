using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WishTrip.Migrations
{
    /// <inheritdoc />
    public partial class Added_IsRepeatVisit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRepeatVisit",
                table: "AppTravelExperiences",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRepeatVisit",
                table: "AppTravelExperiences");
        }
    }
}
