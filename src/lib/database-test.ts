import { supabase, dbService } from './supabase';

/**
 * Comprehensive database testing utility
 * Tests all database operations and connections
 */
class DatabaseTester {
  private results: Array<{ test: string; status: 'pass' | 'fail'; message: string; duration: number }> = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting comprehensive database tests...');
    
    await this.testConnection();
    await this.testTableStructure();
    await this.testDataRetrieval();
    await this.testDataInsertion();
    await this.testDataUpdates();
    await this.testAuthentication();
    
    this.printResults();
  }

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({ test: testName, status: 'pass', message: 'Success', duration });
      console.log(`✅ ${testName} - ${duration}ms`);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.results.push({ test: testName, status: 'fail', message: error.message, duration });
      console.error(`❌ ${testName} - ${error.message} - ${duration}ms`);
    }
  }

  private async testConnection(): Promise<void> {
    await this.runTest('Database Connection', async () => {
      const { data, error } = await supabase.from('cases').select('count').limit(1);
      if (error) throw new Error(`Connection failed: ${error.message}`);
    });
  }

  private async testTableStructure(): Promise<void> {
    const tables = ['cases', 'transcripts', 'hr_interactions', 'ai_insights', 'hr_users'];
    
    for (const table of tables) {
      await this.runTest(`Table Structure: ${table}`, async () => {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) throw new Error(`Table ${table} error: ${error.message}`);
      });
    }
  }

  private async testDataRetrieval(): Promise<void> {
    await this.runTest('Get All Cases', async () => {
      const cases = await dbService.getCases();
      if (!Array.isArray(cases)) throw new Error('Cases should be an array');
      if (cases.length === 0) throw new Error('No cases found - database may be empty');
    });

    await this.runTest('Get Case by Code', async () => {
      // First get a valid confirmation code
      const cases = await dbService.getCases();
      if (cases.length === 0) throw new Error('No cases available for testing');
      
      const testCase = cases[0];
      const retrievedCase = await dbService.getCaseByCode(testCase.confirmation_code);
      if (!retrievedCase) throw new Error('Failed to retrieve case by confirmation code');
      if (retrievedCase.id !== testCase.id) throw new Error('Retrieved wrong case');
    });

    await this.runTest('Get HR Users', async () => {
      const users = await dbService.getHRUsers();
      if (!Array.isArray(users)) throw new Error('HR users should be an array');
      if (users.length === 0) throw new Error('No HR users found');
    });
  }

  private async testDataInsertion(): Promise<void> {
    const testConfirmationCode = `TEST${Date.now()}`;
    let testCaseId: string;

    await this.runTest('Create New Case', async () => {
      const newCase = await dbService.createCase({
        confirmationCode: testConfirmationCode,
        category: 'Test Category',
        summary: 'This is a test case for database validation',
        severity: 3
      });
      
      if (!newCase.id) throw new Error('Case creation failed - no ID returned');
      testCaseId = newCase.id;
    });

    await this.runTest('Add Transcript', async () => {
      if (!testCaseId) throw new Error('No test case ID available');
      
      const transcript = await dbService.addTranscript(
        testCaseId,
        'This is a test transcript for database validation',
        'Test summary',
        -0.2
      );
      
      if (!transcript.id) throw new Error('Transcript creation failed');
    });

    await this.runTest('Add HR Interaction', async () => {
      if (!testCaseId) throw new Error('No test case ID available');
      
      const interaction = await dbService.addInteraction(
        testCaseId,
        'This is a test message for database validation',
        'system',
        'Test System'
      );
      
      if (!interaction.id) throw new Error('Interaction creation failed');
    });

    await this.runTest('Add AI Insight', async () => {
      if (!testCaseId) throw new Error('No test case ID available');
      
      const insight = await dbService.addAIInsight(
        testCaseId,
        'test_insight',
        { test: true, message: 'This is a test insight' },
        0.85
      );
      
      if (!insight.id) throw new Error('AI insight creation failed');
    });

    // Clean up test data
    await this.runTest('Cleanup Test Data', async () => {
      if (!testCaseId) return;
      
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', testCaseId);
      
      if (error) throw new Error(`Cleanup failed: ${error.message}`);
    });
  }

  private async testDataUpdates(): Promise<void> {
    await this.runTest('Update Case Status', async () => {
      const cases = await dbService.getCases();
      if (cases.length === 0) throw new Error('No cases available for testing');
      
      const testCase = cases[0];
      const originalStatus = testCase.status;
      const newStatus = originalStatus === 'open' ? 'investigating' : 'open';
      
      const updatedCase = await dbService.updateCaseStatus(testCase.id, newStatus);
      if (updatedCase.status !== newStatus) throw new Error('Status update failed');
      
      // Restore original status
      await dbService.updateCaseStatus(testCase.id, originalStatus);
    });
  }

  private async testAuthentication(): Promise<void> {
    await this.runTest('HR Authentication - Valid', async () => {
      const user = await dbService.authenticateHR('hr@company.com', 'demo123');
      if (!user.id) throw new Error('Authentication failed for valid credentials');
    });

    await this.runTest('HR Authentication - Invalid', async () => {
      try {
        await dbService.authenticateHR('invalid@email.com', 'wrongpassword');
        throw new Error('Authentication should have failed for invalid credentials');
      } catch (error: any) {
        if (!error.message.includes('Invalid credentials')) {
          throw new Error('Wrong error message for invalid credentials');
        }
      }
    });
  }

  private printResults(): void {
    console.log('\n📊 Database Test Results Summary:');
    console.log('================================');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log(`Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
    }
    
    console.log('\n🎯 Database is', failed === 0 ? 'READY FOR PRODUCTION' : 'NEEDS ATTENTION');
  }
}

// Export convenience function
export const runDatabaseTests = async (): Promise<void> => {
  const tester = new DatabaseTester();
  await tester.runAllTests();
};