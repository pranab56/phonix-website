'use client'

import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/plugins/emoticons.min.css';
import 'froala-editor/js/froala_editor.pkgd.min.js';

import 'froala-editor/js/plugins/emoticons.min.js';
import 'froala-editor/js/plugins/lists.min.js';
import FroalaEditor from 'react-froala-wysiwyg';

const Page = () => {
  const config = {
    placeholderText: 'Write your post description here...',
    heightMin: 300,
    toolbarButtons: [
      ['bold', 'italic', 'underline', 'formatOL', 'formatUL', 'insertImage', 'emoticons']
    ],
    pluginsEnabled: ['lists', 'emoticons', 'image'],
    quickInsertTags: [],
    listAdvancedTypes: true,
    listStyles: {
      'fr-list-style-1': 'Circle',
      'fr-list-style-2': 'Square',
      'fr-list-style-3': 'Decimal',
      'fr-list-style-4': 'Lower Alpha',
      'fr-list-style-5': 'Upper Alpha',
      'fr-list-style-6': 'Lower Roman',
      'fr-list-style-7': 'Upper Roman'
    }
  };

  return (
    <div className="container mx-auto">
      <FroalaEditor config={config} />
    </div>
  );
};

export default Page;