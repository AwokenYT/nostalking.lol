import useConfig from './lib/config.js';

export default useConfig({
    port: 8080,
    mode: 'dev',
    options: {
        //Messes up uv
        minify: false,
        //Beta
        assetScrambling: false,
        allowDangerousTemplateInsert: false,
        api: {
            domain: 'api.skoolworld.org',
            secure: true
        }
    }
});
