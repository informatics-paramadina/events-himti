#!/usr/bin/env node

/**
 * Database Health Check Script
 * Verifica se a conexão com o banco de dados está funcionando
 */

// Load environment variables
import { config } from 'dotenv';
config();

import { prisma } from '../lib/prisma.js';

async function checkDatabaseConnection() {
  try {
    console.log('🔍 Verificando conexão com o banco de dados...\n');
    
    // Test connection
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexão com banco de dados: OK\n');
    
    // Check tables
    console.log('📊 Verificando tabelas:\n');
    
    const eventCount = await prisma.event.count();
    console.log(`  • Event: ${eventCount} registros`);
    
    const participantCount = await prisma.participant.count();
    console.log(`  • Participant: ${participantCount} registros`);
    
    const userCount = await prisma.user.count();
    console.log(`  • User: ${userCount} registros`);
    
    console.log('\n✅ Banco de dados está funcionando corretamente!');
    console.log('\n💡 Dica: Se as tabelas estão vazias, você pode executar:');
    console.log('   npx prisma db push');
    console.log('   ou');
    console.log('   npx prisma migrate dev');
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:\n');
    console.error(error.message);
    console.error('\n📝 Possíveis soluções:');
    console.error('  1. Verifique se DATABASE_URL está configurado em .env');
    console.error('  2. Verifique se o banco de dados está acessível');
    console.error('  3. Execute: npx prisma generate');
    console.error('  4. Execute: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();
