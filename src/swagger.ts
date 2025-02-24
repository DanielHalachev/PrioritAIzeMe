
const transformer = require('@nestjs/swagger/plugin');

module.exports.name = 'nestjs-swagger-transformer';
// you should change the version number anytime you change the configuration below - otherwise, jest will not detect changes
module.exports.version = 1;

module.exports.factory = (cs) => {
    return transformer.before(
        {
            // @nestjs/swagger/plugin options (can be empty)
        },
        cs.program, // "cs.tsCompiler.program" for older versions of Jest (<= v27)
    );
};