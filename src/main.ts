import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from 'helmet';
import { HttpExceptionFilter } from "./filter/http-exception.filter";
import { BadRequestException, ValidationError, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SharedModule } from "./shared/shared.module";
import { ConfigService } from "./shared/config/config.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Explicitly allow PUT
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  // Handle OPTIONS requests manually (Optional)
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Accept, Authorization, X-Requested-With',
      );
      return res.sendStatus(204); // No Content
    }
    next();
  });

  app.use(
    helmet.hidePoweredBy(),  // Hides the X-Powered-By header
    helmet.frameguard({ action: 'sameorigin' }),  // Allows framing only from the same origin
    helmet.noSniff() // Prevents browsers from following the declared MIME types);
  );

  const configService = app.select(SharedModule).get(ConfigService);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(
          validationErrors.map((error: any) => ({
            field: error.property,
            error: Object.values(error.constraints).join(', '),
          })),
        );
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vanalis API Documentation')
    .setDescription('Vanalis API Documentation Specifications')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // Enable big int in json serialize
  (BigInt.prototype as any).toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  await app.listen(configService.getNumber('PORT') || 4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
