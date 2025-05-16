import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('venue/:venueId')
  @ApiOperation({ summary: 'Get venue performance metrics' })
  @ApiQuery({ name: 'startDate', type: Date })
  @ApiQuery({ name: 'endDate', type: Date })
  @ApiResponse({ status: 200, description: 'Returns venue performance metrics' })
  async getVenuePerformance(
    @Param('venueId') venueId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.analyticsService.getVenuePerformanceMetrics(venueId, startDate, endDate);
  }

  @Get('host/dashboard')
  @ApiOperation({ summary: 'Get host dashboard metrics' })
  @ApiQuery({ name: 'startDate', type: Date })
  @ApiQuery({ name: 'endDate', type: Date })
  @ApiResponse({ status: 200, description: 'Returns host dashboard metrics' })
  async getHostDashboard(
    @GetUser() user: User,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.analyticsService.getHostDashboardMetrics(user.id, startDate, endDate);
  }
} 