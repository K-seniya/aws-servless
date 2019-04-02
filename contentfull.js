const contentful = require('contentful');
const chalk = require('chalk');
const Table = require('cli-table2');

const SPACE_ID = '7dx3vsencnik';
const ACCESS_TOKEN = '7933193a20329017e10e10dc0ddde891e6bed27fd2a4ac76475721cadccc48a6';

//  example of rendering https://jsfiddle.net/contentful/kefaj4s8/

const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: SPACE_ID,
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: ACCESS_TOKEN
});

let self = module.exports = {
    runBoilerplate: function() {
        self.displayContentTypes()
            .then(self.displayEntries)
            .then(() => {
                console.log('Want to go further? Feel free to check out this guide:');
                console.log(chalk.cyan('https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/\n'))
            })
            .catch((error) => {
                console.log(chalk.red('\nError occurred:'));
                if (error.stack) {
                    console.error(error.stack);
                    return
                }
                console.error(error)
            })
    },

    displayContentTypes: function() {
        console.log(chalk.green('Fetching and displaying Content Types ...'));
        return self.fetchContentTypes()
            .then((contentTypes) => {
                // Display a table with Content Type information
                const table = new Table({
                    head: ['Id', 'Title', 'Fields']
                });
                contentTypes.forEach((contentType) => {
                    const fieldNames = contentType.fields
                        .map((field) => field.name)
                        .sort();
                    table.push([contentType.sys.id, contentType.name, fieldNames.join(', ')])
                });
                console.log(table.toString());

                return contentTypes
            })
    },

    displayEntries: function(contentTypes) {
        console.log(chalk.green('Fetching and displaying Entries ...'));

        return Promise.all(contentTypes.map((contentType) => {
            return self.fetchEntriesForContentType(contentType)
                .then((entries) => {
                    console.log(`\These are the first 100 Entries for Content Type ${chalk.cyan(contentType.name)}:\n`);

                    // Display a table with Entry information
                    const table = new Table({
                        head: ['Id', 'Title']
                    });
                    entries.forEach((entry) => {
                        table.push([entry.sys.id, entry.fields[contentType.displayField] || '[empty]'])
                    });
                    console.log(table.toString())
                })
        }))
    },

    fetchContentTypes: function() {
        return client.getContentTypes()
            .then((response) => response.items)
            .catch((error) => {
                console.log(chalk.red('\nError occurred while fetching Content Types:'));
                console.error(error)
            })
    },

    fetchEntriesForContentType: function(contentType) {
        return client.getEntries({
            content_type: contentType.sys.id
        })
            .then((response) => response.items)
            .catch((error) => {
                console.log(chalk.red(`\nError occurred while fetching Entries for ${chalk.cyan(contentType.name)}:`));
                console.error(error)
            })
    }
};
