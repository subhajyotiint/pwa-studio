const mock = {
    after: jest.fn(),
    visitor: {
        'index.js': jest.fn(),
        '**/*.css': jest.fn()
    }
};

const factory = () => mock;

factory.mock = mock;

module.exports = factory;
