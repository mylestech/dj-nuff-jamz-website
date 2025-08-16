#!/usr/bin/env node

/**
 * Cloudflare CDN Performance Testing Script
 * Tests website performance before and after Cloudflare implementation
 */

const https = require('https');
const { performance } = require('perf_hooks');

class CloudflarePerformanceTester {
  constructor() {
    this.baseUrl = 'https://djnuffjamz.com';
    this.testUrls = [
      '/',
      '/css/style.css',
      '/assets/favicon.ico'
    ];
    this.results = [];
  }

  async measureLoadTime(url) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const req = https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const loadTime = endTime - startTime;
          
          resolve({
            url,
            statusCode: res.statusCode,
            loadTime: Math.round(loadTime),
            contentLength: Buffer.byteLength(data),
            headers: res.headers,
            cloudflareCacheStatus: res.headers['cf-cache-status'] || 'No Cloudflare',
            cloudflareRay: res.headers['cf-ray'] || 'No Cloudflare'
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async runPerformanceTest() {
    console.log('🚀 Starting Cloudflare CDN Performance Test');
    console.log('============================================\n');
    
    for (const urlPath of this.testUrls) {
      const fullUrl = this.baseUrl + urlPath;
      
      try {
        console.log(`Testing: ${fullUrl}`);
        
        // Run multiple tests for average
        const tests = [];
        for (let i = 0; i < 3; i++) {
          tests.push(await this.measureLoadTime(fullUrl));
          // Small delay between tests
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const avgLoadTime = Math.round(
          tests.reduce((sum, test) => sum + test.loadTime, 0) / tests.length
        );
        
        const result = {
          ...tests[0], // Use first test for headers
          averageLoadTime: avgLoadTime,
          allTests: tests
        };
        
        this.results.push(result);
        this.displayResult(result);
        
      } catch (error) {
        console.error(`❌ Error testing ${fullUrl}:`, error.message);
      }
      
      console.log(''); // Empty line between tests
    }
    
    this.displaySummary();
  }

  displayResult(result) {
    const cfStatus = result.cloudflareCacheStatus;
    const cfIndicator = cfStatus !== 'No Cloudflare' ? '☁️ ' : '🌐 ';
    
    console.log(`${cfIndicator}Status: ${result.statusCode}`);
    console.log(`⚡ Load Time: ${result.averageLoadTime}ms`);
    console.log(`📦 Size: ${this.formatBytes(result.contentLength)}`);
    
    if (cfStatus !== 'No Cloudflare') {
      console.log(`☁️ CF Cache: ${cfStatus}`);
      console.log(`🌐 CF Ray: ${result.cloudflareRay}`);
      
      // Check performance optimizations
      const headers = result.headers;
      if (headers['content-encoding']?.includes('br')) {
        console.log('✅ Brotli compression enabled');
      } else if (headers['content-encoding']?.includes('gzip')) {
        console.log('✅ Gzip compression enabled');
      }
      
      if (headers['x-content-type-options']) {
        console.log('✅ Security headers present');
      }
    } else {
      console.log('⚠️  Cloudflare not detected');
    }
  }

  displaySummary() {
    console.log('\n📊 PERFORMANCE SUMMARY');
    console.log('=====================');
    
    const totalLoadTime = this.results.reduce((sum, r) => sum + r.averageLoadTime, 0);
    const avgLoadTime = Math.round(totalLoadTime / this.results.length);
    
    console.log(`📈 Average Load Time: ${avgLoadTime}ms`);
    
    const cloudflareEnabled = this.results.some(r => 
      r.cloudflareCacheStatus !== 'No Cloudflare'
    );
    
    if (cloudflareEnabled) {
      console.log('✅ Cloudflare CDN: Active');
      
      const cacheHits = this.results.filter(r => 
        r.cloudflareCacheStatus === 'HIT'
      ).length;
      
      const cacheHitRate = Math.round((cacheHits / this.results.length) * 100);
      console.log(`📊 Cache Hit Rate: ${cacheHitRate}%`);
      
      // Performance recommendations
      console.log('\n🎯 RECOMMENDATIONS:');
      
      if (avgLoadTime > 1000) {
        console.log('⚠️  Consider enabling more aggressive caching');
      }
      
      if (cacheHitRate < 80) {
        console.log('⚠️  Cache hit rate could be improved');
      } else {
        console.log('✅ Excellent cache performance!');
      }
      
    } else {
      console.log('❌ Cloudflare CDN: Not Active');
      console.log('💡 Follow setup guide in scripts/cloudflare-setup.md');
    }
    
    console.log('\n🔍 Core Web Vitals Assessment:');
    if (avgLoadTime < 1000) {
      console.log('✅ Good LCP (Largest Contentful Paint)');
    } else {
      console.log('⚠️  LCP could be improved');
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI execution
if (require.main === module) {
  const tester = new CloudflarePerformanceTester();
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Cloudflare CDN Performance Tester

Usage: node test-cloudflare-performance.js [options]

Options:
  --help, -h     Show this help message
  --url [URL]    Test specific URL (default: djnuffjamz.com)

Examples:
  node test-cloudflare-performance.js
  node test-cloudflare-performance.js --url https://nuffjamz.com
    `);
    process.exit(0);
  }
  
  // Custom URL if provided
  const urlIndex = args.indexOf('--url');
  if (urlIndex !== -1 && args[urlIndex + 1]) {
    tester.baseUrl = args[urlIndex + 1];
  }
  
  tester.runPerformanceTest().catch(console.error);
}

module.exports = CloudflarePerformanceTester;
