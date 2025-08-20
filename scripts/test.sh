#!/bin/bash

# Flex Living Test Runner Script
# This script provides convenient commands for running tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if dependencies are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi

    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found. Installing dependencies..."
        npm install
    fi

    print_success "Dependencies are ready"
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests..."
    npm run test
}

# Function to run tests in watch mode
run_watch_tests() {
    print_status "Running tests in watch mode..."
    npm run test:watch
}

# Function to run tests with coverage
run_coverage_tests() {
    print_status "Running tests with coverage..."
    npm run test:coverage
}

# Function to run tests with UI
run_ui_tests() {
    print_status "Running tests with UI..."
    npm run test:ui
}

# Function to run specific test file
run_specific_test() {
    if [ -z "$1" ]; then
        print_error "Please provide a test file pattern"
        echo "Usage: $0 specific <test-pattern>"
        echo "Example: $0 specific dashboard-store"
        exit 1
    fi

    print_status "Running tests matching pattern: $1"
    npm run test -- --run "$1"
}

# Function to run critical tests only
run_critical_tests() {
    print_status "Running critical tests..."
    npm run test -- --run "src/test/integration"
}

# Function to lint test files
lint_tests() {
    print_status "Linting test files..."
    npx eslint "src/test/**/*.{ts,tsx}" --fix
}

# Function to show test help
show_help() {
    echo "Flex Living Test Runner"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  all           Run all tests"
    echo "  watch         Run tests in watch mode"
    echo "  coverage      Run tests with coverage report"
    echo "  ui            Run tests with UI interface"
    echo "  critical      Run only critical integration tests"
    echo "  specific      Run specific test file (requires pattern)"
    echo "  lint          Lint test files"
    echo "  clean         Clean test cache and coverage"
    echo "  setup         Install dependencies and setup tests"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all                    # Run all tests"
    echo "  $0 watch                  # Run tests in watch mode"
    echo "  $0 coverage               # Run with coverage"
    echo "  $0 specific store         # Run tests matching 'store'"
    echo "  $0 critical               # Run critical tests only"
}

# Function to clean test artifacts
clean_tests() {
    print_status "Cleaning test artifacts..."

    if [ -d "coverage" ]; then
        rm -rf coverage
        print_success "Removed coverage directory"
    fi

    if [ -d "node_modules/.vitest" ]; then
        rm -rf node_modules/.vitest
        print_success "Removed vitest cache"
    fi

    print_success "Test artifacts cleaned"
}

# Function to setup tests
setup_tests() {
    print_status "Setting up tests..."
    check_dependencies

    print_status "Running initial test to verify setup..."
    npm run test -- --run --reporter=verbose 2>/dev/null || {
        print_warning "Some tests failed during setup, but this is expected"
    }

    print_success "Test setup complete!"
    echo ""
    echo "Available test commands:"
    echo "  npm run test              # Run all tests"
    echo "  npm run test:watch        # Watch mode"
    echo "  npm run test:coverage     # With coverage"
    echo "  npm run test:ui          # With UI"
    echo ""
    echo "Or use this script:"
    echo "  ./scripts/test.sh all     # Run all tests"
    echo "  ./scripts/test.sh help    # Show help"
}

# Main script logic
case "${1:-help}" in
    "all")
        check_dependencies
        run_all_tests
        ;;
    "watch")
        check_dependencies
        run_watch_tests
        ;;
    "coverage")
        check_dependencies
        run_coverage_tests
        ;;
    "ui")
        check_dependencies
        run_ui_tests
        ;;
    "critical")
        check_dependencies
        run_critical_tests
        ;;
    "specific")
        check_dependencies
        run_specific_test "$2"
        ;;
    "lint")
        check_dependencies
        lint_tests
        ;;
    "clean")
        clean_tests
        ;;
    "setup")
        setup_tests
        ;;
    "help"|*)
        show_help
        ;;
esac
