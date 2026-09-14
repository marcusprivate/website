import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from '@playwright/test';

const jsYamlSource = readFileSync(
  join(process.cwd(), 'node_modules/js-yaml/dist/js-yaml.min.js'),
  'utf8'
);

const bookingWidgetStub = `
  window.__bookingWidgetCalls = [];
  window.SimplybookWidget = function(options) {
    this.options = options;
    this.addButtonWidgetStyles = () => {};
    this.showPopupFrame = (step) => {
      window.__bookingWidgetCalls.push({ step, triggerText: this._triggerElement?.textContent?.trim() });
      let frame = document.querySelector('iframe[title="Plan je healing"]');
      if (!frame) {
        frame = document.createElement('iframe');
        frame.title = 'Plan je healing';
        frame.srcdoc = '<main><h1>Plan je healing</h1><p>Testversie van de boekingswidget.</p></main>';
        document.body.appendChild(frame);
      }
    };
  };
`;

/** Makes page tests independent from third-party availability. */
export async function stubExternalServices(page: Page): Promise<void> {
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js', route =>
    route.fulfill({ contentType: 'application/javascript', body: jsYamlSource })
  );
  await page.route('**/gc.zgo.at/count.js', route =>
    route.fulfill({ contentType: 'application/javascript', body: '' })
  );
  await page.route('https://widget.simplybook.it/v2/widget/widget.js', route =>
    route.fulfill({ contentType: 'application/javascript', body: bookingWidgetStub })
  );
}
