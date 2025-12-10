import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform/transform.interceptor";
import { Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ActivityService } from "../service/activity.service";
import { ResponseMessage } from "src/decorators/response/response-message.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { GetUser } from "src/decorators/get-user/get-user.decorator";
import { User } from "prisma/generated/client";
import { ActivityFeedQueryDto } from "../dto/activity-feed-query.dto";
import { ActivityByProjectQueryDto } from "../dto/activity-by-project-query.dto";
import { MyActivitiesQueryDto } from "../dto/my-activities-query.dto";

@ApiTags('Activity')
@UseInterceptors(TransformInterceptor)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved activity feed!",
  })
  @ResponseMessage("Successfully retrieved activity feed!")
  @Get('feed')
  async getActivityFeed(
    @Query() query: ActivityFeedQueryDto,
  ) {
    return this.activityService.getActivityFeed(query);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved activities by project!",
  })
  @ResponseMessage("Successfully retrieved activities by project!")
  @Get('by-project/:projectId')
  async getActivityFeedByProject(
    @Param('projectId') projectId: string,
    @Query() query: ActivityByProjectQueryDto,
  ) {
    return this.activityService.getActivityFeedByProject(projectId, query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Successfully retrieved my recent activities!",
  })
  @ResponseMessage("Successfully retrieved my recent activities!")
  @Get('my-activities')
  async getMyActivities(
    @Query() query: MyActivitiesQueryDto,
    @GetUser() user: User
  ) {
    return this.activityService.getMyActivities(query, user);
  }
}