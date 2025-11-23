import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProjectService } from "../service/project.service";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";
import { PaginateFunction, paginator } from "src/commons/paginator.common";
import { BrowseProjectQueryDto } from "../dto/browse-project-query.dto";
import { AuthGuard } from "src/guards/auth.guard";
import { User } from "prisma/generated/client";
import { GetUser } from "src/decorators/get-user/get-user.decorator";
import { MyProjectQueryDto } from "../dto/my-project-query.dto";
import { MySubmissionQueryDto } from "../dto/my-submission-query.dto";

@ApiTags('Project')
@UseInterceptors(TransformInterceptor)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved featured projects!",
  })
  @ResponseMessage("Successfully retrieved featured projects!")
  @Get('featured')
  async getFeaturedProjects() {
    return this.projectService.getFeaturedProjects();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved projects!",
  })
  @ResponseMessage("Successfully retrieved projects!")
  @Get('browse')
  async browseProjects(
    @Query() query: BrowseProjectQueryDto,
  ) {
    return this.projectService.browseProjects(query);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved project detail!",
  })
  @ResponseMessage("Successfully retrieved project detail!")
  @Get('detail/:id')
  async getProjectDetails(@Param('id') id: string) {
    return this.projectService.getProjectDetail(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved submission detail!",
  })
  @ResponseMessage("Successfully retrieved submission detail!")
  @Get('submission/:id')
  async getSubmissionDetail(@Param('id') id: string) {
    return this.projectService.getSubmissionDetail(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved my projects!",
  })
  @ResponseMessage("Successfully retrieved my projects!")
  @Get('my-projects')
  async getMyProjects(
    @Query() query: MyProjectQueryDto,
    @GetUser() user: User,
  ) {
    return this.projectService.getMyProjects(query, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved my submissions!",
  })
  @ResponseMessage("Successfully retrieved my submissions!")
  @Get('my-submissions')
  async getMySubmissions(
    @Query() query: MySubmissionQueryDto,
    @GetUser() user: User,
  ) {
    return this.projectService.getMySubmissions(query, user);
  }
}