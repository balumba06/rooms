import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
// import swaggerUi from '@fastify/swagger-ui'; // Раскомментируйте, если установили этот пакет
import prismaPlugin from './plugins/prisma.js';

const server = Fastify({
  logger: true
});

const start = async () => {
  try {
    // Регистрация плагинов
    await server.register(cors, { origin: true });
    
    await server.register(swagger, {
      openapi: {
        info: { title: 'Rooms API', version: '1.0.0' },
      },
    });

    await server.register(prismaPlugin);

    // Простой маршрут для проверки
    server.get('/api/health', async () => {
      return { status: 'ok' };
    });

    // Маршрут для пользователей
    server.get('/api/users', async () => {
      const users = await server.prisma.user.findMany();
      return users;
    });

    // Запуск сервера
    // Важно: host '0.0.0.0' нужен для Docker
    const port = parseInt(process.env.PORT || '3000');
    await server.listen({ port, host: '0.0.0.0' });
    
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
