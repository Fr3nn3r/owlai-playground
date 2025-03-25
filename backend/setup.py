from setuptools import setup, find_packages

setup(
    name="owlai-playground-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.109.0",
        "uvicorn>=0.27.0",
        "python-dotenv>=1.0.0",
        "httpx>=0.26.0",
    ],
)
