# TOGAF Exam Study Hub

A comprehensive study platform for TOGAF certification exams with duplicate question detection and frequency analysis.

## 🚀 Features

- **Two Exam Parts**: Part 1 (Foundation - 40 questions) and Part 2 (Practitioner - 8 questions)
- **Image Support**: Questions can include diagrams and visual aids
- **Frequency Tracking**: Questions ranked by appearance frequency across multiple sources
- **Duplicate Detection**: Python utility to identify and merge similar questions
- **Responsive Design**: Works on desktop and mobile devices
- **GitHub Pages Ready**: Static hosting compatible

## 📁 Project Structure

```
togaf-exam-hub/
├── index.html              # Main application
├── styles.css              # Stylesheet
├── data/
│   ├── part1.json         # Part 1 Foundation questions
│   └── part2.json         # Part 2 Practitioner questions
├── static/
│   └── images/            # Question images and diagrams
├── scripts/
│   └── question_analyzer.py  # Duplicate detection utility
└── README.md
```

## 🛠️ Setup

1. **Clone or download** this repository
2. **Add question images** to `static/images/` folder
3. **Update JSON files** with your questions in `data/` folder
4. **Deploy to GitHub Pages** or serve locally

### Local Development

```bash
# Serve locally (Python 3)
python -m http.server 8000

# Or with Node.js
npx serve .

# Access at http://localhost:8000
```

### GitHub Pages Deployment

1. Push to GitHub repository
2. Go to Settings > Pages
3. Select source branch (main/master)
4. Your site will be available at `https://username.github.io/repository-name`

## 📊 Question Analysis Tool

The Python analyzer helps identify duplicate questions and provides statistics:

### Usage Examples

```bash
# Analyze all questions in data directory
python scripts/question_analyzer.py --analyze data/

# Show statistics for specific file
python scripts/question_analyzer.py --stats data/part1.json

# Merge multiple question sources
python scripts/question_analyzer.py --merge source1.json source2.json --output merged.json

# Adjust similarity threshold (default 85%)
python scripts/question_analyzer.py --analyze data/ --threshold 0.90
```

### Features

- **Duplicate Detection**: Identifies similar questions using text similarity
- **Frequency Analysis**: Tracks question appearance across sources
- **Statistics**: Provides detailed analysis reports
- **Merging**: Combines multiple question sources intelligently

## 📝 JSON Structure

### Question Format

```json
{
  "id": "p1_q001",
  "number": 1,
  "text": "Question text here?",
  "image": "diagram.png",
  "correctAnswer": "The correct answer text",
  "frequency": 5
}
```

### File Structure

```json
{
  "title": "TOGAF Part 1 - Foundation Exam",
  "description": "40 questions covering TOGAF fundamentals",
  "totalQuestions": 40,
  "passingScore": 60,
  "timeLimit": 60,
  "questions": [...]
}
```

## 🎯 Adding New Questions

1. **Edit JSON files** in `data/` folder
2. **Add images** to `static/images/` if needed
3. **Run analyzer** to check for duplicates:
   ```bash
   python scripts/question_analyzer.py --analyze data/
   ```
4. **Update frequency** based on source reliability

## 🔍 Question Frequency System

- **Frequency 1-2**: Rare questions, single source
- **Frequency 3-4**: Common questions, multiple sources  
- **Frequency 5+**: High-priority questions, very common

The analyzer automatically combines frequencies when merging duplicates from multiple sources.

## 📱 Responsive Design

- Mobile-friendly interface
- Touch-optimized interactions
- Adaptive layouts for all screen sizes

## 🚀 Deployment Checklist

- [ ] Questions added to JSON files
- [ ] Images uploaded to static/images/
- [ ] Duplicates analyzed and merged
- [ ] Local testing completed
- [ ] Repository pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Site accessible and functional

## 🤝 Contributing

1. Add new questions to appropriate JSON files
2. Run duplicate analysis
3. Update frequency scores based on source reliability
4. Test locally before deployment
5. Submit pull request with changes

## 📄 License

This project is open source and available under the MIT License.
