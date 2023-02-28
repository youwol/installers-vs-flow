import { ExplorerBackend, AssetsGateway } from '@youwol/http-clients'
import { map, mergeMap } from 'rxjs/operators'
import { from } from 'rxjs'
import { downloadZip } from 'client-zip'
import { raiseHTTPErrors } from '@youwol/http-primitives'
export function contextMenuActions({ node, explorer }) {
    return [
        {
            name: 'New vs-flow.repl',
            icon: { class: 'fas fa-random' },
            enabled: () => true,
            exe: async () => newVsFlowReplProject(node, explorer),
            applicable: () => ExplorerBackend.isInstanceOfFolderResponse(node),
        },
    ]
}

async function newVsFlowReplProject(parentNode, explorer) {
    const assetsGtwClient = new AssetsGateway.Client()
    explorer.newAsset({
        parentNode: parentNode,
        pendingName: 'new vs-flow.repl',
        type: 'vs-flow.repl',
        response$: assetsGtwClient.assets
            .createAsset$({
                queryParameters: { folderId: parentNode.id },
                body: {
                    kind: 'vs-flow.repl',
                    name: 'new vs-flow.repl',
                    description: 'VS-Flow REPL project',
                    tags: ['vs-flow', 'REPL'],
                },
            })
            .pipe(
                raiseHTTPErrors(),
                mergeMap((asset) => {
                    const source = {
                        name: 'source.json',
                        lastModified: new Date(),
                        input: JSON.stringify({ cells: [] }),
                    }
                    return from(downloadZip([source]).blob()).pipe(
                        map((blob) => ({ blob, asset })),
                    )
                }),
                mergeMap(({ blob, asset }) => {
                    return assetsGtwClient.assets
                        .addZipFiles$({
                            assetId: asset.assetId,
                            body: { content: blob },
                        })
                        .pipe(map(() => asset))
                }),
            ),
    })
}

export const applications: string[] = ['@youwol/vs-flow-repl']
