#!/usr/bin/env python3
"""
TOGAF Question Analyzer and Duplicate Detector

This utility helps identify duplicate questions from multiple sources,
group similar questions, and track frequency to identify most likely exam questions.

Usage:
    python question_analyzer.py --analyze data/
    python question_analyzer.py --merge source1.json source2.json --output merged.json
    python question_analyzer.py --stats data/part1.json
"""

import json
import argparse
import hashlib
from pathlib import Path

from difflib import SequenceMatcher
from collections import defaultdict, Counter
import re


class TOGAFQuestionAnalyzer:
    def __init__(self):
        self.similarity_threshold = 0.85  # 85% similarity to consider duplicates
        self.questions_db = {}
        self.duplicate_groups = []
        
    def clean_text(self, text: str) -> str:
        """Clean and normalize text for comparison"""
        # Remove extra whitespace, convert to lowercase
        text = re.sub(r'\s+', ' ', text.lower().strip())
        # Remove common variations that don't affect meaning
        text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
        return text
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two text strings"""
        clean1 = self.clean_text(text1)
        clean2 = self.clean_text(text2)
        return SequenceMatcher(None, clean1, clean2).ratio()
    
    def generate_question_hash(self, question_text: str, correct_answer: str) -> str:
        """Generate a hash for a question based on text and correct answer"""
        content = self.clean_text(question_text) + self.clean_text(correct_answer)
        return hashlib.md5(content.encode()).hexdigest()[:12]
    
    def load_questions_from_file(self, file_path: Path) -> Dict:
        """Load questions from a JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"✓ Loaded {len(data.get('questions', []))} questions from {file_path.name}")
                return data
        except Exception as e:
            print(f"✗ Error loading {file_path}: {e}")
            return {}
    
    def find_duplicates(self, questions: List[Dict]) -> List[List[Dict]]:
        """Find duplicate or very similar questions"""
        duplicates = []
        processed = set()
        
        for i, q1 in enumerate(questions):
            if i in processed:
                continue
                
            similar_group = [q1]
            processed.add(i)
            
            for j, q2 in enumerate(questions[i+1:], i+1):
                if j in processed:
                    continue
                    
                similarity = self.calculate_similarity(q1['text'], q2['text'])
                
                if similarity >= self.similarity_threshold:
                    similar_group.append(q2)
                    processed.add(j)
            
            if len(similar_group) > 1:
                duplicates.append(similar_group)
        
        return duplicates
    
    def merge_duplicate_questions(self, duplicate_group: List[Dict]) -> Dict:
        """Merge duplicate questions into a single question with combined metadata"""
        # Use the question with highest frequency as base
        base_question = max(duplicate_group, key=lambda q: q.get('frequency', 0))
        
        # Combine frequencies
        total_frequency = sum(q.get('frequency', 1) for q in duplicate_group)
        
        merged = base_question.copy()
        merged['frequency'] = total_frequency
        merged['duplicate_count'] = len(duplicate_group)
        merged['confidence_score'] = min(100, total_frequency * 10)  # Confidence based on frequency
        
        return merged
    
    def analyze_question_file(self, file_path: Path) -> Dict:
        """Analyze a single question file for duplicates and statistics"""
        data = self.load_questions_from_file(file_path)
        if not data or 'questions' not in data:
            return {}
        
        questions = data['questions']
        duplicates = self.find_duplicates(questions)
        
        # Statistics
        stats = {
            'file': file_path.name,
            'total_questions': len(questions),
            'duplicate_groups': len(duplicates),
            'unique_questions': len(questions) - sum(len(group)-1 for group in duplicates),
            'high_frequency': len([q for q in questions if q.get('frequency', 0) >= 4]),
            'with_images': len([q for q in questions if q.get('image')]),
            'duplicates': duplicates
        }
        
        return stats
    
    def merge_question_files(self, file_paths: List[Path], output_path: Path):
        """Merge multiple question files, combining duplicates"""
        all_questions = []
        all_metadata = {}
        
        # Load all questions from all files
        for file_path in file_paths:
            data = self.load_questions_from_file(file_path)
            if data and 'questions' in data:
                # Add source file to each question
                for q in data['questions']:
                    q['source_file'] = file_path.name
                all_questions.extend(data['questions'])
                
                # Merge metadata
                if not all_metadata:
                    all_metadata = {k: v for k, v in data.items() if k != 'questions'}
        
        # Find and merge duplicates
        duplicates = self.find_duplicates(all_questions)
        merged_questions = []
        processed_indices = set()
        
        # Process duplicate groups
        for duplicate_group in duplicates:
            merged_question = self.merge_duplicate_questions(duplicate_group)
            merged_questions.append(merged_question)
            
            # Mark original questions as processed
            for q in duplicate_group:
                for i, orig_q in enumerate(all_questions):
                    if orig_q['id'] == q['id']:
                        processed_indices.add(i)
                        break
        
        # Add non-duplicate questions
        for i, q in enumerate(all_questions):
            if i not in processed_indices:
                merged_questions.append(q)
        
        # Sort by frequency (highest first) and then by number
        merged_questions.sort(key=lambda q: (-q.get('frequency', 0), q.get('number', 0)))
        
        # Update metadata
        all_metadata['questions'] = merged_questions
        all_metadata['totalQuestions'] = len(merged_questions)
        all_metadata['merged_from'] = [fp.name for fp in file_paths]
        all_metadata['merge_date'] = "2024-01-21"
        
        # Save merged file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(all_metadata, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Merged {len(all_questions)} questions into {len(merged_questions)} unique questions")
        print(f"✓ Found {len(duplicates)} duplicate groups")
        print(f"✓ Saved to {output_path}")
        
        return all_metadata
    
    def generate_report(self, stats: Dict) -> str:
        """Generate a detailed analysis report"""
        report = []
        report.append(f"📊 TOGAF Question Analysis Report")
        report.append(f"{'='*50}")
        report.append(f"File: {stats['file']}")
        report.append(f"Total Questions: {stats['total_questions']}")
        report.append(f"Unique Questions: {stats['unique_questions']}")
        report.append(f"Duplicate Groups: {stats['duplicate_groups']}")
        report.append(f"High Frequency (≥4): {stats['high_frequency']}")
        report.append(f"With Images: {stats['with_images']}")
        report.append("")
        
        # Duplicate details
        if stats['duplicates']:
            report.append("🔍 Duplicate Question Groups:")
            for i, group in enumerate(stats['duplicates'], 1):
                report.append(f"  Group {i} ({len(group)} questions):")
                for q in group:
                    report.append(f"    - Q{q.get('number', '?')}: {q['text'][:60]}...")
                report.append("")
        
        return "\n".join(report)


def main():
    parser = argparse.ArgumentParser(description='TOGAF Question Analyzer')
    parser.add_argument('--analyze', type=str, help='Analyze questions in directory or file')
    parser.add_argument('--merge', nargs='+', help='Merge multiple question files')
    parser.add_argument('--output', type=str, help='Output file for merge operation')
    parser.add_argument('--stats', type=str, help='Show statistics for a question file')
    parser.add_argument('--threshold', type=float, default=0.85, help='Similarity threshold for duplicates')
    
    args = parser.parse_args()
    
    analyzer = TOGAFQuestionAnalyzer()
    analyzer.similarity_threshold = args.threshold
    
    if args.analyze:
        path = Path(args.analyze)
        if path.is_dir():
            # Analyze all JSON files in directory
            json_files = list(path.glob('*.json'))
            for json_file in json_files:
                stats = analyzer.analyze_question_file(json_file)
                if stats:
                    print(analyzer.generate_report(stats))
                    print("\n" + "="*60 + "\n")
        else:
            # Analyze single file
            stats = analyzer.analyze_question_file(path)
            if stats:
                print(analyzer.generate_report(stats))
    
    elif args.merge:
        if not args.output:
            print("❌ --output is required for merge operation")
            return
        
        file_paths = [Path(fp) for fp in args.merge]
        output_path = Path(args.output)
        analyzer.merge_question_files(file_paths, output_path)
    
    elif args.stats:
        stats = analyzer.analyze_question_file(Path(args.stats))
        if stats:
            print(analyzer.generate_report(stats))
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
