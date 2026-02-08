export class BehavioralSimulator {
  private lastActivity: number = Date.now();
  private isIdle: boolean = false;

  constructor(private options: any) {}

  public async simulateDelay(type: 'typing' | 'read' | 'action' = 'action'): Promise<void> {
    if (!this.options.enable) return;

    let delay = 0;
    switch (type) {
      case 'typing':
        if (this.options.typingSimulation) {
          // 30-80 WPM simulation (approx 150-400ms per char, averaged to a burst)
          delay = Math.floor(Math.random() * 2000) + 500; 
        }
        break;
      case 'read':
        if (this.options.readReceiptDelays) {
          // 1-5 seconds reading time
          delay = Math.floor(Math.random() * 4000) + 1000;
        }
        break;
      case 'action':
      default:
        // Pattern Diffusion / Human-like delays (1-5s)
        if (this.options.patternDiffusion) {
            delay = Math.floor(Math.random() * 4000) + 1000;
        } else {
            // Basic random delay if pattern diffusion is off but generic simulation is on
            delay = Math.floor(Math.random() * 1000) + 200;
        }
        break;
    }

    // Activity Randomization (Simulate idle times)
    if (this.options.activityRandomization && Math.random() < 0.05) { // 5% chance of idle
        console.log('[BehavioralSimulator] Simulating user idle time...');
        delay += Math.floor(Math.random() * 60000) + 10000; // 10s - 70s idle
    }

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastActivity = Date.now();
  }

  public getTypingDuration(textLength: number): number {
    // Approx 5 chars per word, 40 WPM => 200 CPM => ~300ms per char
    const baseDuration = textLength * 300;
    // Add variance
    const variance = Math.random() * 0.4 + 0.8; // 0.8 - 1.2
    return Math.floor(baseDuration * variance);
  }
}
