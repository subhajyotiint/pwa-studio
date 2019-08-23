const debug = require('../util/debug').makeFileLogger(__filename);
const { relative, resolve } = require('path');
const walk = require('klaw');
const micromatch = require('micromatch');

const getBuildpackInstructions = require('./getBuildpackInstructions');

function createProject(options) {
    const { template, directory } = options;

    const { instructions, packageRoot } = getBuildpackInstructions(template, [
        'create'
    ]);
    const { after, visitor } = instructions.create;

    const copyGlobs = Object.keys(visitor);
    const visit = ({ stats, path }) => {
        const relativePath = relative(packageRoot, path);
        const targetPath = resolve(directory, relativePath);
        const pattern = copyGlobs.find(glob =>
            micromatch.isMatch(relativePath, glob, { dot: true })
        );
        if (pattern) {
            debug(`visit: ${path} matches ${pattern}`);
            visitor[pattern]({
                stats,
                path,
                targetPath,
                options
            });
        } else {
            debug(`visit: ${path} matches no pattern in ${copyGlobs}`);
        }
    };

    return new Promise((succeed, fail) => {
        let failed = false;
        const copyStream = walk(packageRoot, {
            filter: p => !p.includes('node_modules/')
        });

        copyStream.on('readable', function() {
            let item;
            while (!failed && (item = this.read())) {
                debug(`visiting ${item.path}`);
                try {
                    visit(item);
                } catch (e) {
                    failed = true;
                    fail(e);
                }
            }
        });
        copyStream.on('error', fail);
        copyStream.on('end', () => {
            if (after) {
                try {
                    after({ options });
                    succeed();
                } catch (e) {
                    failed = true;
                    fail(e);
                }
            } else {
                succeed();
            }
        });
    });
}

module.exports = createProject;
