from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

def preprocess_text(text):
    # Convert to lowercase and remove punctuation
    text = re.sub(r'[^\w\s]', '', text.lower())
    
    # Tokenize the text
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [token for token in tokens if token not in stop_words]
    
    # Stem the tokens
    stemmer = PorterStemmer()
    tokens = [stemmer.stem(token) for token in tokens]
    
    return ' '.join(tokens)

@app.route('/')
def home():
    app.logger.info("Rendering home page")
    return render_template('index.html')

@app.route('/check_plagiarism', methods=['POST'])
def check_plagiarism():
    app.logger.info("Received plagiarism check request")
    try:
        data = request.json
        app.logger.debug(f"Received data: {data}")
        text1 = data['text1']
        text2 = data['text2']

        # Preprocess the texts
        processed_text1 = preprocess_text(text1)
        processed_text2 = preprocess_text(text2)

        # Calculate similarity using TF-IDF and cosine similarity
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform([processed_text1, processed_text2])
        similarity = cosine_similarity(vectors[0], vectors[1])[0][0]

        # Calculate plagiarism percentage
        plagiarism_percentage = similarity * 100

        result = {
            'similarity': similarity,
            'plagiarism_percentage': plagiarism_percentage
        }
        app.logger.info(f"Plagiarism check result: {result}")
        return jsonify(result)

    except Exception as e:
        app.logger.error(f"Error in check_plagiarism: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

