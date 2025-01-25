import { Injectable } from '@nestjs/common';
import * as Sentiment from 'sentiment';

@Injectable()
export class SentimentService {
    private sentimentAnalyzer: Sentiment;

    constructor() {
        this.sentimentAnalyzer = new Sentiment();
    }

    async analyze(text: string): Promise<{ score: number, comparative: number }> {
        if (!text) {
            throw new Error('Text cannot be empty');
        }
        const result = this.sentimentAnalyzer.analyze(text);
        return {
            score: result.score,
            comparative: result.comparative,
        };
    }
}
