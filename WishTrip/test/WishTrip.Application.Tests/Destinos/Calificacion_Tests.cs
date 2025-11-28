using NSubstitute;
using Shouldly;
using System;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.ObjectMapping;
using Volo.Abp.Users;
using Xunit;

namespace WishTrip.Destinos;

public class Calificacion_Tests
{
    private readonly CalificacionAppServiceTestWrapper _calificacionAppService;
    private readonly IRepository<Calificacion, Guid> _repoMock;
    private readonly ICurrentUser _currentUserMock;
    private readonly IObjectMapper _objectMapperMock;

    public Calificacion_Tests()
    {
        _repoMock = Substitute.For<IRepository<Calificacion, Guid>>();
        _currentUserMock = Substitute.For<ICurrentUser>();
        _objectMapperMock = Substitute.For<IObjectMapper>();

        _calificacionAppService = new CalificacionAppServiceTestWrapper(
            _repoMock,
            _currentUserMock,
            _objectMapperMock
        );
    }

    // 1. VALIDACIÓN: ASOCIACIÓN DE USUARIO (Lógica Principal)
    [Fact]
    public async Task CreateAsync_Should_Assign_CurrentUser_To_Calificacion()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserMock.Id.Returns(userId); // El usuario está logueado

        var input = new CreateUpdateCalificacionDto
        {
            DestinoId = Guid.NewGuid(),
            Puntaje = 5,
            Comentario = "Excelente"
        };

        // Configuramos Mocks del Mapper
        _objectMapperMock.Map<CreateUpdateCalificacionDto, Calificacion>(Arg.Any<CreateUpdateCalificacionDto>())
            .Returns(new Calificacion { DestinoId = input.DestinoId, Puntaje = input.Puntaje });

        _objectMapperMock.Map<Calificacion, CalificacionDto>(Arg.Any<Calificacion>())
             .Returns(new CalificacionDto { Puntaje = 5 });

        _repoMock.InsertAsync(Arg.Any<Calificacion>()).Returns(call => call.Arg<Calificacion>());

        // Act
        await _calificacionAppService.CreateAsync(input);

        // Assert: Verificamos que al repositorio llegó la entidad con el UserId correcto
        await _repoMock.Received(1).InsertAsync(Arg.Is<Calificacion>(c => c.UserId == userId));
    }

    // 2. VALIDACIÓN: COMENTARIOS OPCIONALES (Lógica Secundaria)
    [Fact]
    public async Task CreateAsync_Should_Accept_Null_Comments()
    {
        // Arrange
        _currentUserMock.Id.Returns(Guid.NewGuid());

        var input = new CreateUpdateCalificacionDto
        {
            DestinoId = Guid.NewGuid(),
            Puntaje = 4,
            Comentario = null // El comentario es opcional (null)
        };

        _objectMapperMock.Map<CreateUpdateCalificacionDto, Calificacion>(Arg.Any<CreateUpdateCalificacionDto>())
           .Returns(new Calificacion { Puntaje = 4, Comentario = null });

        _objectMapperMock.Map<Calificacion, CalificacionDto>(Arg.Any<Calificacion>())
             .Returns(new CalificacionDto { Puntaje = 4 });

        _repoMock.InsertAsync(Arg.Any<Calificacion>()).Returns(call => call.Arg<Calificacion>());

        // Act
        await _calificacionAppService.CreateAsync(input);

        // Assert: Verificamos que se guardó sin explotar aunque el comentario sea null
        await _repoMock.Received(1).InsertAsync(Arg.Is<Calificacion>(c => c.Comentario == null));
    }
}

// --- Wrapper necesario para Mocks ---
public class CalificacionAppServiceTestWrapper : CalificacionAppService
{
    private readonly IObjectMapper _testMapper;

    public CalificacionAppServiceTestWrapper(
        IRepository<Calificacion, Guid> repository,
        ICurrentUser currentUser,
        IObjectMapper testMapper) : base(repository, currentUser)
    {
        _testMapper = testMapper;
    }

    protected override Task<Calificacion> MapToEntityAsync(CreateUpdateCalificacionDto input)
    {
        return Task.FromResult(_testMapper.Map<CreateUpdateCalificacionDto, Calificacion>(input));
    }

    protected override Task<CalificacionDto> MapToGetOutputDtoAsync(Calificacion entity)
    {
        return Task.FromResult(_testMapper.Map<Calificacion, CalificacionDto>(entity));
    }
}