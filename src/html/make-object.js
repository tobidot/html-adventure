import process from 'node:process';
import fs from 'node:fs';

const scene = process.argv[2];
const object = process.argv[3];

const object_content = `<!DOCTYPE game-interactable SYSTEM "http://www.game-object.com/dtd/interactable">
<game-interactable id="${scene}/${object}" class="object map-object">
    <game-data class="data">
        <game-data-action type="interact">
            <game-logic type="all">
                <game-logic-action type="output">
                    [Footsteps]
                </game-logic-action>
                <game-logic-action type="change-scene" value="scene-${object}"> </game-logic-action>
            </game-logic>
        </game-data-action>
        <game-data-action type="inspect">
            <game-logic-action type="output">
                I can go there.
            </game-logic-action>
        </game-data-action>
    </game-data>
    <object
            class="click-area"
            data="./images/map/${scene}/${object}.svg"
            type="image/svg+xml"
    > </object>
</game-interactable>
`;

const map_object_file = `./objects/${scene}/${object}.xml`;
fs.writeFileSync(map_object_file, object_content);

const location_file = `./locations/${scene}.xml`;
const location_original_content = fs.readFileSync(location_file, 'utf8');
const location_content = `<load src="/src/html/objects/${scene}/${object}.xml"/>`;

const location_content_updated = location_original_content.replace(
'</game-location>',
`    ${location_content}
</game-location>`
);

fs.writeFileSync(location_file, location_content_updated);

//echo <<<HTML
//HTML;
